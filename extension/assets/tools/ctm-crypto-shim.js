"use strict";

const crypto = require("crypto");

function deriveLegacyKey(password, keyLength) {
  const source = Buffer.from(String(password || ""), "utf8");
  const hash = crypto.createHash("sha256").update(source).digest();
  if (keyLength <= hash.length) {
    return hash.subarray(0, keyLength);
  }

  const key = Buffer.alloc(keyLength);
  for (let i = 0; i < keyLength; i += 1) {
    key[i] = hash[i % hash.length];
  }
  return key;
}

if (typeof crypto.createCipher !== "function") {
  crypto.createCipher = function createCipherCompat(algorithm, password) {
    const keyLength = algorithm.includes("256") ? 32 : 16;
    const key = deriveLegacyKey(password, keyLength);
    const iv = Buffer.alloc(16, 0);
    return crypto.createCipheriv(algorithm, key, iv);
  };
}

if (typeof crypto.createDecipher !== "function") {
  crypto.createDecipher = function createDecipherCompat(algorithm, password) {
    const keyLength = algorithm.includes("256") ? 32 : 16;
    const key = deriveLegacyKey(password, keyLength);
    const iv = Buffer.alloc(16, 0);
    return crypto.createDecipheriv(algorithm, key, iv);
  };
}
