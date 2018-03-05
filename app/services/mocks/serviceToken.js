/**
 * Mocked service token
 * @type {string}
 */
const token = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJyZWZlcmVuY2UiLCJleHAiOjE1MTkwNjQ5ODJ9.otdhPdFjbLTiMeNRFXJPPrI39lfps3RGc7Qi9B7uX7H0mNjiI1Dps1Lx0ZpYf7Z7kGhHtpaND6DSoQsCx9LFQQ';

module.exports = {
  /**
   * Mock to return a service token.
   */
  lease: () => {
    return new Promise(resolve => {
      resolve(token);
    });
  },

  /**
   * Mock to return token expiry.
   */
  isTokenExpired: () => {
    return false;
  }
};
