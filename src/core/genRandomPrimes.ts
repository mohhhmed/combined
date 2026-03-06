import { randomBigInt } from './bigIntUtils';
import { isPrimeBigInt } from './genPrimeArr';

/**
 * Generates two random 1024-bit primes for RSA-2048.
 */
export const genRandomPrimes = (bitLength: number = 1024): bigint[] => {
    const generatePrime = (): bigint => {
        while (true) {
            const p = randomBigInt(bitLength);
            // Ensure it's odd and has the high bit set
            if (p % BigInt(2) !== BigInt(0) && isPrimeBigInt(p)) {
                return p;
            }
        }
    };

    const p = generatePrime();
    let q = generatePrime();

    // Ensure p and q are distinct
    while (q === p) {
        q = generatePrime();
    }

    return [p, q];
};
