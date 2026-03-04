/**
 * RSA Decryption Engine (CRT Optimized)
 * Implements high-performance decryption using the Chinese Remainder Theorem.
 */

export const modExp = (base: bigint, exponent: bigint, mod: bigint): bigint => {
    let result = BigInt(1);
    base = base % mod;

    while (exponent > BigInt(0)) {
        if (exponent % BigInt(2) === BigInt(1)) {
            result = (result * base) % mod;
        }
        exponent = exponent >> BigInt(1); // Divide exponent by 2
        base = (base * base) % mod;
    }

    return result;
};

/**
 * Decrypts an array of BigInt chunks using CRT for performance.
 * @param encryptedChunks The array of encrypted BigInts.
 * @param P The first prime factor.
 * @param Q The second prime factor.
 * @param DP Prior d mod (p-1).
 * @param DQ Prior d mod (q-1).
 * @param QInv The modular inverse of q modulo p.
 * @param originalLength The exact length of the original data in bytes.
 */
export const decryptBinaryCRT = (
    encryptedChunks: bigint[],
    P: bigint,
    Q: bigint,
    DP: bigint,
    DQ: bigint,
    QInv: bigint,
    originalLength: number
): Uint8Array => {
    const bitLength = (P * Q).toString(2).length;
    const byteLength = Math.floor((bitLength - 1) / 8);

    const decryptedBytes: number[] = [];

    for (let i = 0; i < encryptedChunks.length; i++) {
        const c = encryptedChunks[i];

        // 1. Compute Mp = c^dp mod p and Mq = c^dq mod q
        const mp = modExp(c, DP, P);
        const mq = modExp(c, DQ, Q);

        // 2. Garner's Reconstruction:
        // h = qInv * (mp - mq) mod p
        let h = (QInv * (mp - mq)) % P;
        if (h < BigInt(0)) h += P;

        // M = mq + h * Q
        let m = mq + h * Q;

        // Convert BigInt back to bytes
        const chunkBytes: number[] = [];
        for (let j = 0; j < byteLength; j++) {
            chunkBytes.unshift(Number(m & BigInt(0xFF)));
            m >>= BigInt(8);
        }

        const currentTotal = decryptedBytes.length;
        const bytesToTake = Math.min(byteLength, originalLength - currentTotal);

        if (bytesToTake > 0) {
            const actualData = chunkBytes.slice(byteLength - bytesToTake);
            decryptedBytes.push(...actualData);
        }
    }

    return new Uint8Array(decryptedBytes);
};
