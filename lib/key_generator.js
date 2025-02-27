/**
 * Generates random keys for documents
 */
class KeyGenerator {
  /**
   * Initialize the key generator
   * @param {Object} options - Configuration options
   * @param {string} options.keyspace - Characters to use for key generation
   * @param {string} options.prefix - Optional prefix for keys
   */
  constructor(options = {}) {
    this.keyspace = options.keyspace || 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    this.prefix = options.prefix || '';
  }

  /**
   * Create a random key of specified length
   * @param {number} keyLength - Length of the key to generate
   * @returns {string} - Generated key
   */
  createKey(keyLength) {
    let key = this.prefix;
    const effectiveLength = keyLength - this.prefix.length;
    
    for (let i = 0; i < effectiveLength; i++) {
      const index = Math.floor(Math.random() * this.keyspace.length);
      key += this.keyspace.charAt(index);
    }
    
    return key;
  }

  /**
   * Create a random key using a more secure random source
   * @param {number} keyLength - Length of the key to generate
   * @returns {string} - Generated key
   */
  createSecureKey(keyLength) {
    try {
      const crypto = require('crypto');
      let key = this.prefix;
      const effectiveLength = keyLength - this.prefix.length;
      
      // Generate random bytes and convert to characters from keyspace
      const randomBytes = crypto.randomBytes(effectiveLength * 2); // Get more bytes than needed
      
      for (let i = 0; i < effectiveLength; i++) {
        // Use 2 bytes (16 bits) for each character to reduce bias
        const randomValue = randomBytes.readUInt16BE(i * 2) % this.keyspace.length;
        key += this.keyspace.charAt(randomValue);
      }
      
      return key;
    } catch (error) {
      // Fall back to less secure method if crypto not available
      return this.createKey(keyLength);
    }
  }
}

module.exports = KeyGenerator;
