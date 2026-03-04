/**
 * RSA Encryption Engine
 * Implements chunking and binary data handling for RSA encryption.
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
 * Encrypts a Uint8Array using RSA.
 * Splits the data into chunks that are smaller than N.
 */
export const encryptBinary = (data: Uint8Array, E: bigint, N: bigint): bigint[] => {
    // Determine chunk size based on N
    const bitLength = N.toString(2).length;
    const byteLength = Math.floor((bitLength - 1) / 8);

    if (byteLength < 1) {
        throw new Error("Modulus N is too small for binary encryption. Use larger primes.");
    }

    const encryptedChunks: bigint[] = [];

    for (let i = 0; i < data.length; i += byteLength) {
        const chunk = data.slice(i, i + byteLength);

        // Convert chunk (Uint8Array) to a single BigInt
        let m = BigInt(0);
        for (let j = 0; j < chunk.length; j++) {
            m = (m << BigInt(8)) | BigInt(chunk[j]);
        }

        // Encrypt: C = M^E mod N
        const c = modExp(m, E, N);
        encryptedChunks.push(c);
    }

    return encryptedChunks;
};
