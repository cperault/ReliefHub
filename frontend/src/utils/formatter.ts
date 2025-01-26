export const formatPhoneNumber = (value: string): string => {
  if (!value) {
    return "";
  }

  const cleanedNumber = value.replace(/\D/g, "");

  // Handle backspace - if the last character was a formatting character
  if (value.length < cleanedNumber.length) {
    return cleanedNumber.slice(0, -1);
  }

  // Format the number as (XXX) XXX-XXXX
  if (cleanedNumber.length >= 10) {
    return `(${cleanedNumber.slice(0, 3)}) ${cleanedNumber.slice(3, 6)}-${cleanedNumber.slice(6, 10)}`;
  } else if (cleanedNumber.length >= 6) {
    return `(${cleanedNumber.slice(0, 3)}) ${cleanedNumber.slice(3, 6)}-${cleanedNumber.slice(6)}`;
  } else if (cleanedNumber.length >= 3) {
    return `(${cleanedNumber.slice(0, 3)}) ${cleanedNumber.slice(3)}`;
  }

  return cleanedNumber;
};
