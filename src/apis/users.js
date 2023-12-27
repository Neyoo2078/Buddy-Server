import {
  ResetPassword,
  RegisterValidations,
  AuthenticateValidations,
} from '../validators';
import { join } from 'path';
import { User } from '../models';
import { Router } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET } from '../constants';
import { randomBytes } from 'crypto';
import { userAuth } from '../middlewares/auth-guard';
import Validator from '../middlewares/validator-middleware';
import {
  sendGmailSMTP,
  sendGmailPasswordResetToken,
  sendGmailPasswordReset,
} from '../functions/nodemailer_sendmail';
import { generateRandomNumbers } from '../functions/random';

const router = Router();

/**
 * @description To create a new User Accounts
 * @api /users/api/register
 * @access Public
 * @type POST
 */
router.post(
  '/admin/register',
  RegisterValidations,
  Validator,
  async (req, res) => {
    try {
      let { email } = req.body;
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          success: false,
          message:
            'Email is already registered. Did you forget the password. Try resetting it.',
        });
      }
      const otp = generateRandomNumbers();

      user = new User({
        ...req.body,
        verificationCode: otp,
      });
      user = await user.save();
      const token = await user.generateOTPJWT();

      user.token = token;
      await user.save();
      await sendGmailSMTP(user);
      return res.status(201).json({
        email: user.email,
        success: true,
        message:
          'Hurray! your account is created please verify your email address.',
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred.',
      });
    }
  }
);

/**
 * @description To verify a new user's account via email
 * @api /users/verify-now/:verificationCode
 * @access PUBLIC <Only Via email>
 * @type GET
 */
router.post('/admin/verify-otp', async (req, res) => {
  try {
    let { otp } = req.body;
    let user = await User.findOne({ verificationCode: otp });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access. Invalid verification code..',
      });
    }
    const decodedData = verify(user.token, SECRET);
    user.token = undefined;
    user.verificationCode = undefined;
    user.verified = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Hurray! your email has been verified.',
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'OTP expired',
    });
  }
});

/**
 * @description To verify a new user's account via email
 * @api /users/verify-now/:verificationCode
 * @access PUBLIC <Only Via email>
 * @type GET
 */
router.post('/admin/resend-otp', async (req, res) => {
  try {
    let { email } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access. Invalid verification code..',
      });
    }
    const otp = generateRandomNumbers();
    console.log(otp);
    user.verificationCode = otp;
    user = await user.save();
    const token = await user.generateOTPJWT();

    user.token = token;
    await user.save();
    await sendGmailSMTP(user);

    return res.status(200).json({
      success: true,
      message: 'Hurray! OTP has been resent.',
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'An error occurred.',
    });
  }
});

/**
 * @description To authenticate an user and get auth token
 * @api /users/api/authenticate
 * @access PUBLIC
 * @type POST
 */
router.post(
  '/admin/login',
  AuthenticateValidations,
  Validator,
  async (req, res) => {
    try {
      let { email, password } = req.body;

      let user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Username not found.',
        });
      }
      if (!(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password.',
        });
      }
      let token = await user.generateJWT();
      return res.status(200).json({
        success: true,
        user: user.getUserInfo(),
        token: `Bearer ${token}`,
        message: 'Hurray! You are now logged in.',
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred.',
      });
    }
  }
);

/**
 * @description To get the authenticated user's profile
 * @api /users/api/authenticate
 * @access Private
 * @type GET
 */
router.get('/api/authenticate', userAuth, async (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
});

/**
 * @description To initiate the password reset process
 * @api /users/api/reset-password
 * @access Public
 * @type POST
 */
router.put(
  '/api/reset-password',
  ResetPassword,
  Validator,
  async (req, res) => {
    try {
      let { email } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User with the email is not found.',
        });
      }
      user.generatePasswordReset();
      await user.save();
      // Sent the password reset Link in the email.
      // let html = `
      //   <div>
      //       <h1>Hello, ${user.username}</h1>
      //       <p>Please click the following link to reset your password.</p>
      //       <p>If this password reset request is not created by your then you can inore this email.</p>
      //       <a href="${DOMAIN}users/reset-password-now/${user.resetPasswordToken}">Verify Now</a>
      //   </div>
      // `;
      // await sendMail(
      //   user.email,
      //   'Reset Password',
      //   'Please reset your password.',
      //   html
      // );

      await sendGmailPasswordResetToken(user);
      return res.status(404).json({
        success: true,
        message: 'Password reset link is sent your email.',
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred.',
      });
    }
  }
);

/**
 * @description To resnder reset password page
 * @api /users/reset-password/:resetPasswordToken
 * @access Restricted via email
 * @type GET
 */
router.get('/reset-password-now/:resetPasswordToken', async (req, res) => {
  try {
    let { resetPasswordToken } = req.params;
    let user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpiresIn: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }
    return res.sendFile(join(__dirname, '../templates/password-reset.html'));
  } catch (err) {
    return res.sendFile(join(__dirname, '../templates/errors.html'));
  }
});

/**
 * @description To reset the password
 * @api /users/api/reset-password-now
 * @access Restricted via email
 * @type POST
 */
router.post('/api/reset-password-now', async (req, res) => {
  try {
    let { resetPasswordToken, password } = req.body;
    let user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpiresIn: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresIn = undefined;
    await user.save();
    // Send notification email about the password reset successfull process
    // let html = `
    //     <div>
    //         <h1>Hello, ${user.username}</h1>
    //         <p>Your password is resetted successfully.</p>
    //         <p>If this rest is not done by you then you can contact our team.</p>
    //     </div>
    //   `;
    // await sendMail(
    //   user.email,
    //   'Reset Password Successful',
    //   'Your password is changed.',
    //   html
    // );

    await sendGmailPasswordReset(user);
    return res.status(200).json({
      success: true,
      message:
        'Your password reset request is complete and your password is resetted successfully. Login into your account with your new password.',
    });
  } catch (err) {
    return res.status(500).json({
      sucess: false,
      message: 'Something went wrong.',
    });
  }
});

export default router;
