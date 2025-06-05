const Joi = require("joi");

function evaluatePasswordStrength(password) {
  const suggestions = [];
  let score = 0;

  if (password.length >= 12) score++;
  else suggestions.push("Use at least 12 characters");

  if (/[a-z]/.test(password)) score++;
  else suggestions.push("Include lowercase letters");

  if (/[A-Z]/.test(password)) score++;
  else suggestions.push("Include uppercase letters");

  if (/[0-9]/.test(password)) score++;
  else suggestions.push("Include numbers");

  if (/[\W_]/.test(password)) score++;
  else suggestions.push("Include symbols (e.g. @, #, $, etc.)");

  if (!/\s/.test(password)) score++;
  else suggestions.push("Avoid using spaces");

  // not same as username
  const normalizedPassword = password.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();
  if (normalizedPassword !== normalizedUsername) score++;
  else suggestions.push("Password cannot be the same as username");

  // not a common password
  const commonPasswords = [
    "123456",
    "password",
    "123456789",
    "12345678",
    "12345",
    "1234567",
    "qwerty",
    "abc123",
    "password1",
    "123123",
    "admin",
    "letmein",
    "welcome",
    "iloveyou",
    "monkey",
    "football",
    "sunshine",
    "master",
    "hello",
    "freedom",
  ];
  if (!commonPasswords.includes(password.toLowerCase())) score++;
  else suggestions.push("Avoid using common passwords");

  let strength = "Weak";
  if (score >= 7) strength = "Very Strong";
  else if (score >= 6) strength = "Strong";
  else if (score >= 4) strength = "Medium";

  return { strength, suggestions };
}

const registrationSchema = Joi.object({
  username: Joi.string().required().messages({
    "string.empty": "Username is required",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be valid",
  }),
  phoneNumber: Joi.string().required().messages({
    "string.empty": "Phone number is required",
  }),
  password: Joi.string().required().custom((value, helpers) => {
    const { strength, suggestions } = evaluatePasswordStrength(value);
    if (strength === "Weak") {
      return helpers.error("any.custom", { suggestions });
    }
    return value;
  }, "Password strength validation"),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required",
  }),
});

function validateRegistrationInput(input) {
  const { error, value } = registrationSchema.validate(input, { abortEarly: false });

  let suggestions = [];
  if (error) {
    // Check if suggestions are in context
    error.details.forEach((detail) => {
      if (detail.context && detail.context.suggestions) {
        suggestions = detail.context.suggestions;
      }
    });
  }

  const strength = evaluatePasswordStrength(input.password).strength;

  return {
    isValid: !error,
    errors: error ? error.details.map((e) => e.message) : [],
    suggestions,
    strength,
  };
}

module.exports = { validateRegistrationInput };
