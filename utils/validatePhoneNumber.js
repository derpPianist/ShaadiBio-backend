export const validatePhoneNumber = (phoneNumber) => {
  switch (true) {
    case !/^[6-9]\d{9}$/.test(phoneNumber):
      return {
        valid: false,
        error: "Phone number must be 10 digits and start with 6, 7, 8, or 9",
      };
    default:
      return { valid: true, error: null };
  }
};