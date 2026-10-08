// Text and String Formatters for User Profiles and Names

export const formatFullName = (firstName, lastName) => {
  if (firstName && lastName)
    return `${firstName} ${lastName}`;
};

export const formatInitials = (firstName, lastName) => {
  if (firstName && lastName) {
    const firstLetter = firstName.charAt(0);
    const lastLetter = lastName.charAt(0);
    return `${firstLetter}${lastLetter}`.toUpperCase();
  }
};

export const formatRoleKey = (roleName) => {
  if (roleName)
    return roleName.toLowerCase().replace(' ', '_');
};

export const formatPhoneNumber = (phoneNumber) => {
  if (phoneNumber === undefined || phoneNumber === null || phoneNumber === '') {
    return 'Not Set';
  }
  let cleaned = phoneNumber.toString().replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0'))
    cleaned = cleaned.slice(1);
  else if (cleaned.startsWith('63'))
    cleaned = cleaned.slice(2);

  if (cleaned.length === 10) {
    const part1 = cleaned.slice(0, 3);
    const part2 = cleaned.slice(3, 6);
    const part3 = cleaned.slice(6, 10);
    return `(+63) ${part1}-${part2}-${part3}`;
  }
  return `(+63) ${cleaned}`;
};
