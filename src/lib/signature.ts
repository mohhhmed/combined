import { sha256 } from './sha256';
import { modExp } from './decryptor';

/**
 * Signs a Uint8Array using RSA private key via CRT
 * 1. Hashes the data using SHA-256
 * 2. Formats the hash into a BigInt
 * 3. Applies the private key using CRT equations
 * 
 * @param data The data to sign
 * @param P The first prime factor
 * @param Q The second prime factor
 * @param DP Prior d mod (p-1)
 * @param DQ Prior d mod (q-1)
 * @param QInv The modular inverse of q modulo p
 * @returns The generated signature as a string representation of a BigInt
 */
export const signWithCRT = (
    data: Uint8Array,
    P: bigint,
    Q: bigint,
    DP: bigint,
    DQ: bigint,
    QInv: bigint
): string => {
    // 1. Hash the data
    const hashBytes = sha256(data);

    // 2. Convert hash to BigInt
    let m = BigInt(0);
    for (let i = 0; i < hashBytes.length; i++) {
        m = (m << BigInt(8)) | BigInt(hashBytes[i]);
    }

    // 3. Apply CRT equations (Signature S = m^d mod n)
    // Compute Sp = m^dp mod p and Sq = m^dq mod q
    const sp = modExp(m, DP, P);
    const sq = modExp(m, DQ, Q);

    // Garner's Reconstruction:
    // h = qInv * (sp - sq) mod p
    let h = (QInv * (sp - sq)) % P;
    if (h < BigInt(0)) h += P;

    // S = sq + h * Q
    const s = sq + h * Q;

    return s.toString();
};
