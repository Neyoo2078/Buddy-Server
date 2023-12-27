import { Schema, model } from 'mongoose';
import { compare, hash } from 'bcryptjs';
import { SECRET } from '../constants';
import { randomBytes } from 'crypto';
import { sign } from 'jsonwebtoken';
import { pick } from 'lodash';

const UserSchema = new Schema(
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
  user.password = await hash(user.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await compare(password, this.password);
};

UserSchema.methods.generateOTPJWT = async function () {
  let payload = {
    firstname: this.firstname,
    email: this.email,
    lastname: this.lastname,
    id: this._id,
    verificationCode: this.verificationCode,
  };

  return await sign(payload, SECRET, { expiresIn: 15 * 60 });
};
UserSchema.methods.generateJWT = async function () {
  let payload = {
    firstname: this.firstname,
    email: this.email,
    lastname: this.lastname,
    id: this._id,
  };
  return await sign(payload, SECRET, { expiresIn: '1 day' });
};

UserSchema.methods.generatePasswordReset = function () {
  this.resetPasswordExpiresIn = Date.now() + 36000000;
  this.resetPasswordToken = randomBytes(20).toString('hex');
};

UserSchema.methods.getUserInfo = function () {
  return pick(this, ['_id', 'firstname', 'email', 'lastname', 'verified']);
};

const User = model('users', UserSchema);
export default User;
