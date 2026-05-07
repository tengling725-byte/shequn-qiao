const CryptoUtil = {
  encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
  },

  decode(encoded) {
    return decodeURIComponent(escape(atob(encoded)));
  },

  getApiKey(envContent) {
    const match = envContent.match(/DOUBAO_API_KEY=(.+)/);
    if (match) {
      return this.decode(match[1].trim());
    }
    return null;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CryptoUtil;
}