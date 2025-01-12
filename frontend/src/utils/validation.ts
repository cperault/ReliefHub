import validator from "validator";

export const validateEmail = (email: string): boolean => {
  return !validator.isEmpty(email) && validator.isEmail(email);
};

export const validatePassword = (password: string): boolean => {
  return !validator.isEmpty(password) && password.length >= 8 && password.length <= 128;
};

export const validateName = (name: string): boolean => {
  return !validator.isEmpty(name) && name.length >= 1 && name.length <= 128 && /^[\p{L}\s'-]+$/u.test(name);
};
