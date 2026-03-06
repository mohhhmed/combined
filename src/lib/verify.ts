import { sha256 } from './sha256';
import { modExp } from './encryptor';

/**
 * Verifies an RSA signature against a given Uint8Array
 * 1. Hashes the incoming data using SHA-256
 * 2. Decrypts the signature using the public key (E, N)
 * 3. Compares the two results
 * 
 * @param data The original signed data
 * @param signatureStr The signature string (BigInt representation)
 * @param E The public exponent
 * @param N The modulus
 * @returns true if the signature is valid, false otherwise
 */
export const verifySignature = (
    data: Uint8Array,
    signatureStr: string,
    E: bigint,
    N: bigint
): boolean => {
    try {
        const signature = BigInt(signatureStr);

        // 1. Hash the incoming data
        const expectedHashBytes = sha256(data);
        let expectedM = BigInt(0);
        for (let i = 0; i < expectedHashBytes.length; i++) {
            expectedM = (expectedM << BigInt(8)) | BigInt(expectedHashBytes[i]);
        }

        // 2. Decrypt the signature: M' = S^E mod N
        const actualM = modExp(signature, E, N);

        // 3. Compare the decrypted hash with the expected hash
        return expectedM === actualM;
    } catch (e) {
        // If there's an issue parsing the signature string, it's invalid
        return false;
    }
};
