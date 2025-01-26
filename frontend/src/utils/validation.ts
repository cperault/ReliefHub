import validator from "validator";
import { State } from "../types";
import { ProfileType } from "../state/user/userSlice";

export const validateEmail = (email: string): boolean => {
  return !validator.isEmpty(email) && validator.isEmail(email);
};

export const validatePassword = (password: string): boolean => {
  return !validator.isEmpty(password) && password.length >= 8 && password.length <= 128;
};

export const validateName = (name: string): boolean => {
  return !validator.isEmpty(name) && name.length >= 1 && name.length <= 128 && /^[\p{L}\s'-]+$/u.test(name);
};

export const validatePhoneNumber = (phoneNumber: string) => {
  const phone = phoneNumber?.toString() || "";

  // most common formats: 1234567890, (123) 456-7890, 123-456-7890, 123.456.7890
  const phoneRegex = /^(\d{10}|\(?[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4})$/;

  if (phoneRegex.test(phone)) {
    const cleanedNumber = phone.replace(/\D/g, "");
    return validator.isMobilePhone(cleanedNumber, "en-US");
  }

  return false;
};

export const validateUserType = (userType: ProfileType): boolean => {
  return userType === ProfileType.VOLUNTEER || userType === ProfileType.AFFECTED;
};

export const validateStreet = (street: string): boolean => {
  const trimmedStreet = street?.trim() ?? "";
  return !validator.isEmpty(trimmedStreet);
};

export const validateCity = (city: string): boolean => {
  const trimmedCity = city?.trim() ?? "";
  return !validator.isEmpty(trimmedCity);
};

export const validateState = (state: string): boolean => {
  const trimmedState = state?.trim() ?? "";
  return Object.values(State).some((value) => value === trimmedState);
};

export const validateZip = (zip: string): boolean => {
  const trimmedZip = zip?.trim() ?? "";
  return validator.isPostalCode(trimmedZip, "US");
};

export const validateLatitude = (latitude: number): boolean => {
  return !validator.isEmpty(latitude.toString()) && validator.isLatLong(latitude.toString());
};

export const validateLongitude = (longitude: number): boolean => {
  return !validator.isEmpty(longitude.toString()) && validator.isLatLong(longitude.toString());
};

export const validateAddressLabel = (label?: string): boolean => {
  return !label || (validator.isLength(label, { min: 1, max: 100 }) && !validator.isEmpty(label.trim()));
};

export const validateAddressNotes = (notes?: string): boolean => {
  return !notes || (validator.isLength(notes, { min: 1, max: 255 }) && !validator.isEmpty(notes.trim()));
};

export const validateAddressContactPhone = (phone?: string): boolean => {
  return !phone || validatePhoneNumber(phone);
};
