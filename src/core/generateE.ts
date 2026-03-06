import { gcd } from './gcd';
import { randomBigInt } from './bigIntUtils';

/**
 * Generates a random Public Exponent E.
 * E must be coprime to phiN and 1 < E < phiN.
 */
export const generateE = (phiN: bigint): bigint => {
    // Generate a random E. We'll use 64 bits to keep it secure but relatively fast.
    let attempts = 0;
    while (attempts < 1000) {
        // Generate random BigInt, ensure it's in range [3, phiN-1]
        let e = randomBigInt(64) % (phiN - BigInt(3)) + BigInt(3);

        // Ensure e is odd (even E cannot be coprime to phiN since phiN is even)
        if (e % BigInt(2) === BigInt(0)) e += BigInt(1);

        if (gcd(e, phiN) === BigInt(1)) {
            return e;
        }
        attempts++;
    }

    // Fallback search if random search fails
    let fallbackE = BigInt(65537);
    while (fallbackE < phiN) {
        if (gcd(fallbackE, phiN) === BigInt(1)) return fallbackE;
        fallbackE += BigInt(2);
    }

    throw new Error("Could not find a valid E");
};
