export const getPasswordRequirements = (password) => {
  const passwordValue = String(password || "");

  return {
    length: passwordValue.length >= 8,
    uppercase: /[A-Z]/.test(passwordValue),
    lowercase: /[a-z]/.test(passwordValue),
    number: /[0-9]/.test(passwordValue),
    symbol: /[^A-Za-z0-9\s]/.test(passwordValue),
  };
};

export const isPasswordValid = (password) => {
  const requirements = getPasswordRequirements(password);
  const requirementValues = Object.values(requirements);

  return requirementValues.every((requirementPassed) => {
    return requirementPassed === true;
  });
};
