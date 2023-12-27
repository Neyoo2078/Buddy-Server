import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { randomBytes } from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
import lodash from 'lodash';
import dotenv from 'dotenv';

dotenv.config();
const SECRET = process.env.APP_SECRET;
const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      required: false,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpiresIn: {
      type: Date,
      required: false,
    },
    token: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  let user = this;
  if (!user.isModified('password')) return next();
  user.password = await bcrypt.hash(user.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateOTPJWT = async function () {
  let payload = {
    firstname: this.firstname,
    email: this.email,
    lastname: this.lastname,
    id: this._id,
    verificationCode: this.verificationCode,
  };

  return await jsonwebtoken.sign(payload, SECRET, { expiresIn: 15 * 60 });
};

UserSchema.methods.generateJWT = async function () {
  let payload = {
    firstname: this.firstname,
    email: this.email,
    lastname: this.lastname,
    id: this._id,
  };
  console.log({ SECRET });
  return await jsonwebtoken.sign(payload, SECRET, { expiresIn: '1 day' });
};

UserSchema.methods.generatePasswordReset = function () {
  this.resetPasswordExpiresIn = Date.now() + 36000000;
  this.resetPasswordToken = randomBytes(20).toString('hex');
};

UserSchema.methods.getUserInfo = function () {
  return lodash.pick(this, [
    '_id',
    'firstname',
    'email',
    'lastname',
    'verified',
  ]);
};

const User = mongoose.model('users', UserSchema);
export default User;
