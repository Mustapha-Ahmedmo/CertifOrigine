/**
 * Generates a simple homemade hash for a given string.
 * @param {string} text - The text to hash.
 * @returns {string} - The hashed string.
 */
export const homemadeHash = (text) => {
    if (!text) return '';
    try {
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = (hash << 5) - hash + char; // Shift left and subtract
        hash |= 0; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(16); // Convert to hex and ensure positive
    } catch (error) {
      console.error('Error creating homemade hash:', error);
      return '';
    }
  };