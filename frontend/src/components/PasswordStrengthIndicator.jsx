import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const PasswordStrengthIndicator = ({ password, fullName }) => {
  // Return early if password is empty
  if (!password) {
    return null;
  }

  // Normalize full name and password to lowercase for comparison (case insensitive)
  const normalizedName = (fullName || '').trim().toLowerCase();
  const normalizedPassword = password.trim().toLowerCase();

  // Check criteria
  const criteria = [
    { label: 'At least 12 characters', test: password.length >= 12 }, 
    { label: 'Contains lowercase letters', test: /[a-z]/.test(password) },
    { label: 'Contains uppercase letters', test: /[A-Z]/.test(password) },
    { label: 'Contains numbers', test: /[0-9]/.test(password) },
    { label: 'Contains symbols', test: /[\W_]/.test(password) },
    { label: 'No spaces', test: !/\s/.test(password) },
    { label: 'Not same as your name', test: normalizedPassword !== normalizedName },
    { label: 'Not a common password', test: !isCommonPassword(password) },
  ];

  // Calculate score (0-8)
  const score = criteria.filter(item => item.test).length;

  // Determine strength
  let strength = 'Weak';
  let colorClass = 'bg-red-500';

  if (score === 10) {
    strength = 'Very Strong';
    colorClass = 'bg-green-700';
  } else if (score >= 8) {
    strength = 'Strong';
    colorClass = 'bg-green-500';
  } else if (score >= 6) {
    strength = 'Medium';
    colorClass = 'bg-yellow-500';
  } 

  // Calculate progress width
  const progressWidth = Math.max(12.5, (score / 8) * 100);

  return (
    <div className="mt-2 mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">Password Strength: {strength}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${progressWidth}%` }}></div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {criteria.map((item, index) => (
          <div key={index} className="flex items-center text-sm">
            {item.test ? (
              <FaCheck className="mr-2 text-green-500" />
            ) : (
              <FaTimes className="mr-2 text-red-500" />
            )}
            <span className={item.test ? 'text-gray-700' : 'text-gray-500'}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to check against common passwords
const isCommonPassword = (password) => {
  const commonPasswords = [
    '123456', 'password', '123456789', '12345678', '12345', '1234567', 'qwerty', 'abc123', 'password1', '123123',
    'admin', 'letmein', 'welcome', 'iloveyou', 'monkey', 'football', 'sunshine', 'master', 'hello', 'freedom'
  ];
  return commonPasswords.includes(password.toLowerCase());
};

export default PasswordStrengthIndicator;