import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const DOMAIN = process.env.APP_DOMAIN;
export const sendGmailSMTP = async (user) => {
  console.log({ user, DOMAIN });
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, //true for 465,false for other port
    auth: {
      user: 'neyoo2078@gmail.com', // email of sender,
      pass: process.env.APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: {
      name: 'Buddy' /* name of website or sender*/,
      address: 'neyoo2078@gmail.com',
    }, //address of the sender
    to: user.email, //list of recievers or for multiple recivers create an array of emails
    subject: 'Email Verification', //subject line
    text: 'Please use the OTP to complete your registration on Buddy', //plain text body
    html: `<div>
        <h4>Hello, ${user.firstname}</h4>
        <p>Please use the OTP code: ${user.verificationCode} to complete your registration on Buddy.</p>
        
      </div>`, //html body
    //   attachments: [
    //     //enable attachment if you need to send attchment with the mail
    //     {
    //       filename: '', // name of file
    //       path: path.join(_dirname, 'text.pdf'), //  import path from path to link with the directory of the file in your app
    //       contentType: '', //type of file
    //     },
    //   ],
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('mail has been sent');
  } catch (error) {
    console.error('error with the mailer');
  }
};

export const sendGmailPasswordResetToken = async (user) => {
  console.log({ user, DOMAIN });
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, //true for 465,false for other port
    auth: {
      user: 'neyoo2078@gmail.com', // email of sender,
      pass: process.env.APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: {
      name: 'Auth website' /* name of website or sender*/,
      address: 'neyoo2078@gmail.com',
    }, //address of the sender
    to: 'neyoo2078@yahoo.com', //list of recievers or for multiple recivers create an array of emails
    subject: 'Please reset your password.', //subject line
    text: 'Please click the following link to verify your account', //plain text body
    html: `<div>
       <h1>Hello, ${user.username}</h1>
       <p>Please click the following link to reset your password.</p>
       <p>If this password reset request is not created by your then you can inore this email.</p>
       <a href="${DOMAIN}users/reset-password-now/${user.resetPasswordToken}">Verify Now</a>
      </div>`, //html body
    //   attachments: [
    //     //enable attachment if you need to send attchment with the mail
    //     {
    //       filename: '', // name of file
    //       path: path.join(_dirname, 'text.pdf'), //  import path from path to link with the directory of the file in your app
    //       contentType: '', //type of file
    //     },
    //   ],
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('mail has been sent');
  } catch (error) {
    console.error('error with the mailer');
  }
};

export const sendGmailPasswordReset = async (user) => {
  console.log({ user, DOMAIN });
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, //true for 465,false for other port
    auth: {
      user: 'neyoo2078@gmail.com', // email of sender,
      pass: process.env.APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: {
      name: 'Auth website' /* name of website or sender*/,
      address: 'neyoo2078@gmail.com',
    }, //address of the sender
    to: 'neyoo2078@yahoo.com', //list of recievers or for multiple recivers create an array of emails
    subject: 'Reset Password Successful', //subject line
    text: 'Your password is changed.', //plain text body
    html: `<div>
      <h1>Hello, ${user.username}</h1>
      <p>Your password is resetted successfully.</p>
      <p>If this rest is not done by you then you can contact our team.</p>
  </div>`, //html body
    //   attachments: [
    //     //enable attachment if you need to send attchment with the mail
    //     {
    //       filename: '', // name of file
    //       path: path.join(_dirname, 'text.pdf'), //  import path from path to link with the directory of the file in your app
    //       contentType: '', //type of file
    //     },
    //   ],
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('mail has been sent');
  } catch (error) {
    console.error('error with the mailer');
  }
};
