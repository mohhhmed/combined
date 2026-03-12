import { genRandomPrimes } from '@root-core/genRandomPrimes';
import { generateE } from '@root-core/generateE';
import { extendedEuclidean } from '@root-core/generateD';

/**
 * Converts a BigInt to a decimal string.
 */
function toDecimal(bi) {
  return bi.toString(10);
}

/**
 * Generates a full RSA-2048 key pair using the core src/core utilities.
 * This implementation matches the logic found in src/browser_app.ts and src/index.ts.
 * 
 * @returns {Object} Key pair parameters as decimal strings.
 */
export function generateRSAKeyPair() {
  // 1. Generate two 1024-bit primes
  const [p, q] = genRandomPrimes(1024);

  // 2. Calculate n and phiN
  const n = p * q;
  const phiN = (p - 1n) * (q - 1n);

  // 3. Generate public exponent e
  const e = generateE(phiN);

  // 4. Calculate private exponent d using extended Euclidean algorithm
  const [gcdE, dValue, _] = extendedEuclidean(e, phiN);
  if (gcdE !== 1n) {
    // In the extremely rare case e and phiN aren't coprime, retry
    return generateRSAKeyPair();
  }

  // Ensure d is positive
  const d = (dValue % phiN + phiN) % phiN;

  // 5. Calculate CRT parameters
  const dp = d % (p - 1n);
  const dq = d % (q - 1n);

  const [gcdQ, qInvValue, _q] = extendedEuclidean(q, p);
  if (gcdQ !== 1n) {
    // Should not happen if p, q are prime
    return generateRSAKeyPair();
  }

  // Ensure qInv is positive
  const qInv = (qInvValue % p + p) % p;

  // 6. Return all 8 parameters as decimal strings for the UI
  return {
    n: toDecimal(n),
    e: toDecimal(e),
    d: toDecimal(d),
    p: toDecimal(p),
    q: toDecimal(q),
    dp: toDecimal(dp),
    dq: toDecimal(dq),
    qInv: toDecimal(qInv),
  };
}
