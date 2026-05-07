const CryptoUtil = {
  encode(str) {
    return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
  },

  decode(encoded) {
    return new TextDecoder().decode(Uint8Array.from(atob(encoded), c => c.charCodeAt(0)));
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