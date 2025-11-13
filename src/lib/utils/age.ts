// Utility functions for age calculations

/**
 * Calculate exact age from birthday
 * @param birthday - Date string in YYYY-MM-DD format
 * @returns Age in years
 */
export function calculateAge(birthday: string | null | undefined): number | null {
  if (!birthday) return null;

  const birthDate = new Date(birthday);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // If birthday hasn't occurred yet this year, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Format age display with birthday
 * @param birthday - Date string in YYYY-MM-DD format
 * @param ageRange - Age range string (e.g., "25-34")
 * @returns Formatted age string
 */
export function formatAgeDisplay(
  birthday: string | null | undefined,
  ageRange: string | null | undefined
): string {
  const exactAge = calculateAge(birthday);

  if (exactAge !== null) {
    return `${exactAge} years old`;
  }

  if (ageRange) {
    return `${ageRange} years`;
  }

  return 'Age not specified';
}

/**
 * Get suggested age range based on exact age
 * @param age - Age in years
 * @returns Suggested age range string
 */
export function suggestAgeRange(age: number): string {
  if (age <= 2) return '0-2';
  if (age <= 5) return '3-5';
  if (age <= 9) return '6-9';
  if (age <= 12) return '10-12';
  if (age <= 17) return '13-17';
  if (age <= 24) return '18-24';
  if (age <= 34) return '25-34';
  if (age <= 44) return '35-44';
  if (age <= 54) return '45-54';
  if (age <= 64) return '55-64';
  return '65+';
}

/**
 * Format birthday for display
 * @param birthday - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "January 15, 1990")
 */
export function formatBirthday(birthday: string | null | undefined): string | null {
  if (!birthday) return null;

  const date = new Date(birthday);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
