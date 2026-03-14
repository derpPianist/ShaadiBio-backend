export const validatePassword = (password) => {
  const specialChars = password.match(/[!@#$%^&*_]/g);

  switch (true) {
    case !/^[A-Za-z\d!@#$%^&*_]{8,20}$/.test(password):
      return { valid: false, error: "Password must be 8-20 characters long" };
    case !/[A-Z]/.test(password):
      return {
        valid: false,
        error: "Password must contain at least one capital letter",
      };
    case !/[a-z]/.test(password):
      return {
        valid: false,
        error: "Password must contain at least one lowercase letter",
      };
    case !/\d/.test(password):
      return {
        valid: false,
        error: "Password must contain at least one number",
      };
    case !specialChars || specialChars.length === 0:
      return {
        valid: false,
        error: "Password must contain at least one special character (!@#$%^&*_)",
      };
    default:
      return { valid: true, error: null };
  }
};
