import { ProfileType } from "../state/user/userSlice";
import {
  validateCity,
  validateName,
  validatePassword,
  validatePhoneNumber,
  validateState,
  validateStreet,
  validateUserType,
  validateZip,
} from "../utils/validation";

import { validateEmail } from "../utils/validation";

export const useFormValidation = () => {
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case "email":
        return validateEmail(value) ? null : "Please enter a valid email address";
      case "password":
        return validatePassword(value) ? null : "Password must be between 8 and 128 characters";
      case "displayName":
        return validateName(value) ? null : "Name must contain only letters, spaces, hyphens and apostrophes";
      case "phoneNumber":
        return validatePhoneNumber(value) ? null : "Please enter a valid phone number";
      case "userType":
        return validateUserType(value as ProfileType) ? null : "Please select a profile user type";
      case "addressStreet":
      case "address.street":
        return validateStreet(value) ? null : "Street address is required";
      case "addressCity":
      case "address.city":
        return validateCity(value) ? null : "City is required";
      case "addressState":
      case "address.state":
        return validateState(value) ? null : "Please select a valid state";
      case "addressZip":
      case "address.zip":
        return validateZip(value) ? null : "Please enter a valid ZIP code";
      default:
        return null;
    }
  };

  return { validateField };
};
