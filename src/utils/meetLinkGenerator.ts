/**
 * Generate a Google Meet-like link for the appointment
 * Note: This generates a mock link for testing purposes.
 * In production, you would integrate with Google Calendar API to create actual Meet links.
 */
export const generateMeetLink = (appointmentId: string): string => {
  // Generate a random 10-character code similar to Google Meet
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const generateSegment = (length: number) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  // Google Meet format: meet.google.com/xxx-xxxx-xxx
  const segment1 = generateSegment(3);
  const segment2 = generateSegment(4);
  const segment3 = generateSegment(3);

  return `https://meet.google.com/${segment1}-${segment2}-${segment3}`;
};

/**
 * Validate if a string is a valid Google Meet link
 */
export const isValidMeetLink = (link: string): boolean => {
  const meetLinkPattern = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
  return meetLinkPattern.test(link);
};


