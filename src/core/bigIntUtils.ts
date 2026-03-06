/**
 * Generates a random BigInt with a specific bit length.
 * Works in both Node.js and Browser environments.
 */
export const randomBigInt = (bits: number): bigint => {
    const bytes = Math.ceil(bits / 8);
    let buffer: Uint8Array;

    if (typeof window !== 'undefined' && (window as any).crypto) {
        // Browser environment
        buffer = new Uint8Array(bytes);
        (window as any).crypto.getRandomValues(buffer);
    } else {
        // Node.js environment - use dynamic require to avoid bundling issues
        try {
            const nodeCrypto = require('crypto');
            buffer = new Uint8Array(nodeCrypto.randomBytes(bytes));
        } catch (e) {
            throw new Error("Random generation not supported in this environment.");
        }
    }

    // Ensure the bit length is exactly as requested by masking the last byte if necessary
    const mask = (1 << (bits % 8)) - 1;
    if (mask !== 0) {
        buffer[0] &= mask;
    }

    // Ensure the highest bit is set to maintain the bit length
    buffer[0] |= (1 << ((bits - 1) % 8));

    let result = BigInt(0);
    for (const byte of buffer) {
        result = (result << BigInt(8)) | BigInt(byte);
    }

    return result;
};

/**
 * Modular exponentiation for BigInt.
 */
export const modExp = (base: bigint, exponent: bigint, mod: bigint): bigint => {
    let result = BigInt(1);
    base = base % mod;

    while (exponent > BigInt(0)) {
        if (exponent % BigInt(2) === BigInt(1)) {
            result = (result * base) % mod;
        }
        exponent = exponent >> BigInt(1);
        base = (base * base) % mod;
    }

    return result;
};
