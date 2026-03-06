import { modExp } from './bigIntUtils';

/**
 * Miller-Rabin Primality Test
 * @param n Number to test
 * @param k Number of iterations (higher = more accurate)
 */
export const isPrimeBigInt = (n: bigint, k: number = 40): boolean => {
    if (n <= BigInt(1)) return false;
    if (n <= BigInt(3)) return true;
    if (n % BigInt(2) === BigInt(0)) return false;

    // Write n-1 as 2^r * d
    let d = n - BigInt(1);
    let r = BigInt(0);
    while (d % BigInt(2) === BigInt(0)) {
        d /= BigInt(2);
        r++;
    }

    // Witness loop
    for (let i = 0; i < k; i++) {
        // Generate random 'a' in range [2, n-2]
        // Note: Using a simpler random generation for 'a' to stay within range
        const a = BigInt(2) + (BigInt(Math.floor(Math.random() * 1000000)) % (n - BigInt(4)));
        let x = modExp(a, d, n);

        if (x === BigInt(1) || x === n - BigInt(1)) continue;

        let composite = true;
        for (let j = 0; j < Number(r) - 1; j++) {
            x = (x * x) % n;
            if (x === n - BigInt(1)) {
                composite = false;
                break;
            }
        }

        if (composite) return false;
    }

    return true;
};
