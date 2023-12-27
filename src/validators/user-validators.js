import { check } from 'express-validator';

const firstname = check('firstname', 'firstname is required.').not().isEmpty();
const lastname = check('lastname', 'lastname is required.').not().isEmpty();
const email = check('email', 'Please provide a valid email address').isEmail();
const ispassword = check('password', 'password is required.').not().isEmpty();
const password = check(
  'password',
  'Password is required of maximum length of 15.'
).isLength({
  max: 15,
});

export const RegisterValidations = [
  password,
  firstname,
  lastname,
  email,
  ispassword,
];
export const AuthenticateValidations = [email, password, ispassword];
export const ResetPassword = [email];
