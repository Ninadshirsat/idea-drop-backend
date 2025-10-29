import { SignJWT } from "jose";
import { JWT_SECRET } from "./getJwtSecret.js";
import crypto from "crypto";

/**
 * Generate a JWT
 * @param {Object} payload - Data to emded in the token
 * @param {string} expireIn - Expiration time (e.g., "15m","7d","30d")
 */

if (!globalThis.crypto) {
  globalThis.crypto = crypto.webcrypto;
}
//above it to tackle the crypto-hash error when using older node version less than v-20

export const generateToken = async (payload, expireIn = "15m") => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" }) //signing algo
    .setIssuedAt() //current time stamp
    .setExpirationTime(expireIn) //time in which current token will expire
    .sign(JWT_SECRET); //signing the token
};
