import * as fs from 'fs';
import * as path from 'path';
import { genPrimeArr } from './core/genPrimeArr';
import { genRandomPrimes } from './core/genRandomPrimes';
import { generateE } from './core/generateE';
import { extendedEuclidean } from './core/generateD';
import { encryptBinary } from './lib/encryptor';
import { decryptBinaryCRT } from './lib/decryptor';

/**
 * RSA File Encryption CLI
 * Simple demonstration of encrypting and decrypting any file.
 */

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log("Usage: ts-node src/index.ts <encrypt|decrypt> <file_path>");
        console.log("Example: ts-node src/index.ts encrypt image.png");
        return;
    }

    const mode = args[0];
    const filePath = args[1];

    if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found - ${filePath}`);
        return;
    }

    // --- Key Generation (for demo purposes we generate keys every time) ---
    // In a real app, you would save/load these.
    console.log("Generating RSA Keys (this may take a moment)...");
    const primeArr = genPrimeArr(104729); // Use a larger prime bit for security (104729 is the 10,000th prime)
    const [p, q] = genRandomPrimes(primeArr);
    const n = BigInt(p) * BigInt(q);
    const phiN = BigInt(p - 1) * BigInt(q - 1);
    const e = BigInt(generateE(Number(n), Number(phiN)));

    // Re-use extendedEuclidean to get D and CRT parameters
    const [gcdE, dValue, _] = extendedEuclidean(Number(e), Number(phiN));
    if (gcdE !== 1) throw new Error("e and phiN are not coprime");
    const d = (BigInt(dValue) % phiN + phiN) % phiN;

    // CRT Parameters
    const dp = d % BigInt(p - 1);
    const dq = d % BigInt(q - 1);
    const [gcdQ, qInvValue, _q] = extendedEuclidean(q, p);
    if (gcdQ !== 1) throw new Error("q and p are not coprime");
    const qInv = (BigInt(qInvValue) % BigInt(p) + BigInt(p)) % BigInt(p);

    console.log(`Public Key (E, N): (${e}, ${n})`);
    console.log(`Private Key (D): ${d}`);
    console.log(`CRT Params: dp=${dp}, dq=${dq}, qInv=${qInv}`);

    const fileBuffer = fs.readFileSync(filePath);

    if (mode === 'encrypt') {
        process.stdout.write(`Encrypting ${filePath}... `);
        const encrypted = encryptBinary(fileBuffer, e, n);

        // Save as JSON for simplicity (contains the array of BigInts)
        const outputPath = filePath + '.enc';
        fs.writeFileSync(outputPath, JSON.stringify(encrypted, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));
        console.log(`DONE! Saved to ${outputPath}`);

        // Also save keys and original length to decrypt later
        const keyPath = filePath + '.keys.json';
        fs.writeFileSync(keyPath, JSON.stringify({
            e: e.toString(),
            d: d.toString(),
            n: n.toString(),
            p: p.toString(),
            q: q.toString(),
            dp: dp.toString(),
            dq: dq.toString(),
            qInv: qInv.toString(),
            originalLength: fileBuffer.length
        }, null, 2));
        console.log(`Keys and metadata saved to ${keyPath}`);

    } else if (mode === 'decrypt') {
        const keyPath = filePath.replace('.enc', '') + '.keys.json';
        if (!fs.existsSync(keyPath)) {
            console.error("Error: Key file not found. Need .keys.json to decrypt.");
            return;
        }

        const keys = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        const p_file = BigInt(keys.p);
        const q_file = BigInt(keys.q);
        const dp_file = BigInt(keys.dp);
        const dq_file = BigInt(keys.dq);
        const qInv_file = BigInt(keys.qInv);
        const originalLength = keys.originalLength;

        process.stdout.write(`Decrypting ${filePath} (using CRT)... `);
        const startTime = Date.now();
        const encryptedData: string[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const encryptedChunks = encryptedData.map(s => BigInt(s));

        const decrypted = decryptBinaryCRT(
            encryptedChunks,
            p_file,
            q_file,
            dp_file,
            dq_file,
            qInv_file,
            originalLength
        );
        const endTime = Date.now();

        const outputPath = filePath.replace('.enc', '.dec');
        fs.writeFileSync(outputPath, decrypted);
        console.log(`DONE! Saved to ${outputPath} (Time: ${endTime - startTime}ms)`);
    }

}

main().catch(console.error);
