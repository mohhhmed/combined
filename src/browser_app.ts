import { genRandomPrimes } from './core/genRandomPrimes';
import { generateE } from './core/generateE';
import { extendedEuclidean, generateD } from './core/generateD';
import { encryptBinary } from './lib/encryptor';
import { decryptBinaryCRT } from './lib/decryptor';
import { sha256 } from './lib/sha256';
import { signWithCRT } from './lib/signature';
import { verifySignature } from './lib/verify';

const encryptInput = document.getElementById('encryptInput') as HTMLInputElement;
const encryptBtn = document.getElementById('encryptBtn') as HTMLButtonElement;
const encryptStatus = document.getElementById('encryptStatus') as HTMLElement;
const keysDisplay = document.getElementById('keysDisplay') as HTMLElement;
const encryptLoader = document.getElementById('encryptLoader') as HTMLElement;

const decryptInput = document.getElementById('decryptInput') as HTMLInputElement;
const keyInput = document.getElementById('keyInput') as HTMLInputElement;
const decryptBtn = document.getElementById('decryptBtn') as HTMLButtonElement;
const decryptStatus = document.getElementById('decryptStatus') as HTMLElement;
const decryptLoader = document.getElementById('decryptLoader') as HTMLElement;

const hashInput = document.getElementById('hashInput') as HTMLInputElement;
const hashBtn = document.getElementById('hashBtn') as HTMLButtonElement;
const hashOutput = document.getElementById('hashOutput') as HTMLElement;
const hashLoader = document.getElementById('hashLoader') as HTMLElement;

const signInput = document.getElementById('signInput') as HTMLInputElement;
const signKeyInput = document.getElementById('signKeyInput') as HTMLInputElement;
const signBtn = document.getElementById('signBtn') as HTMLButtonElement;
const signStatus = document.getElementById('signStatus') as HTMLElement;
const signLoader = document.getElementById('signLoader') as HTMLElement;

const verifyInput = document.getElementById('verifyInput') as HTMLInputElement;
const verifySigInput = document.getElementById('verifySigInput') as HTMLInputElement;
const verifyKeyInput = document.getElementById('verifyKeyInput') as HTMLInputElement;
const verifyBtn = document.getElementById('verifyBtn') as HTMLButtonElement;
const verifyStatus = document.getElementById('verifyStatus') as HTMLElement;
const verifyLoader = document.getElementById('verifyLoader') as HTMLElement;

// Helper to trigger file download
function downloadFile(data: string | Uint8Array, filename: string, type: string) {
    const blob = new Blob([data as BlobPart], { type: type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Cleanup: Some browsers need time to initiate the download before the URL is revoked
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
}

encryptBtn.addEventListener('click', async () => {
    if (!encryptInput.files || encryptInput.files.length === 0) {
        alert("Please select a file to encrypt.");
        return;
    }

    const file = encryptInput.files[0];
    encryptLoader.style.display = 'inline-block';
    encryptStatus.style.display = 'none';

    try {
        const buffer = await file.arrayBuffer();
        const data = new Uint8Array(buffer);

        // --- Key Generation ---
        console.log("Generating RSA-2048 Keys...");
        const [p, q] = genRandomPrimes(1024);
        const n = p * q;
        const phiN = (p - BigInt(1)) * (q - BigInt(1));
        const e = generateE(phiN);

        const [gcdE, dValue, _] = extendedEuclidean(e, phiN);
        if (gcdE !== BigInt(1)) throw new Error("e and phiN are not coprime");
        const d = (dValue % phiN + phiN) % phiN;

        // CRT Parameters
        const dp = d % (p - BigInt(1));
        const dq = d % (q - BigInt(1));
        const [gcdQ, qInvValue, _q] = extendedEuclidean(q, p);
        if (gcdQ !== BigInt(1)) throw new Error("q and p are not coprime");
        const qInv = (qInvValue % p + p) % p;

        // --- Encrypt ---
        const encryptedChunks = encryptBinary(data, e, n);

        // Prepare outputs
        const encryptedBlob = JSON.stringify(encryptedChunks, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        );
        const keysMetadata = JSON.stringify({
            e: e.toString(),
            d: d.toString(),
            n: n.toString(),
            p: p.toString(),
            q: q.toString(),
            dp: dp.toString(),
            dq: dq.toString(),
            qInv: qInv.toString(),
            originalLength: data.length,
            originalName: file.name
        }, null, 2);

        // Download results
        downloadFile(encryptedBlob, `${file.name}.enc`, 'application/json');
        downloadFile(keysMetadata, `${file.name}.keys.json`, 'application/json');

        encryptStatus.style.display = 'block';
        keysDisplay.style.display = 'block';
        keysDisplay.innerHTML = `<strong>RSA-2048 Keys Generated:</strong><br>Modulus N (2048-bit) and Public Exponent E (65537) used.<br>JSON key file downloaded.`;

    } catch (error) {
        console.error(error);
        alert("Encryption failed: " + (error as Error).message);
    } finally {
        encryptLoader.style.display = 'none';
    }
});

decryptBtn.addEventListener('click', async () => {
    if (!decryptInput.files || decryptInput.files.length === 0 || !keyInput.files || keyInput.files.length === 0) {
        alert("Please select both the .enc file and the .keys.json file.");
        return;
    }

    const encFile = decryptInput.files[0];
    const keyFile = keyInput.files[0];
    decryptLoader.style.display = 'inline-block';
    decryptStatus.style.display = 'none';

    try {
        const encText = await encFile.text();
        const keyText = await keyFile.text();

        const encryptedData: string[] = JSON.parse(encText);
        const keys = JSON.parse(keyText);

        const encryptedChunks = encryptedData.map(s => BigInt(s));
        const p_file = BigInt(keys.p);
        const q_file = BigInt(keys.q);
        const dp_file = BigInt(keys.dp);
        const dq_file = BigInt(keys.dq);
        const qInv_file = BigInt(keys.qInv);
        const originalLength = keys.originalLength;
        const originalName = keys.originalName || 'restored_file';

        // --- Decrypt (CRT Optimized) ---
        const decryptedData = decryptBinaryCRT(
            encryptedChunks,
            p_file,
            q_file,
            dp_file,
            dq_file,
            qInv_file,
            originalLength
        );

        downloadFile(decryptedData, `restored_${originalName}`, 'application/octet-stream');
        decryptStatus.style.display = 'block';

    } catch (error) {
        console.error(error);
        alert("Decryption failed: " + (error as Error).message);
    } finally {
        decryptLoader.style.display = 'none';
    }
});

hashBtn.addEventListener('click', async () => {
    if (!hashInput.files || hashInput.files.length === 0) {
        alert("Please select a file to hash.");
        return;
    }

    const file = hashInput.files[0];
    hashLoader.style.display = 'inline-block';
    hashOutput.style.display = 'none';

    try {
        const buffer = await file.arrayBuffer();
        const data = new Uint8Array(buffer);

        // Calculate SHA256 manually using our implemented class
        const hashArray = sha256(data);
        const hashHex = Array.from(hashArray)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        hashOutput.style.display = 'block';
        hashOutput.innerHTML = `<strong>SHA-256 Hash:</strong><br>${hashHex}`;
    } catch (error) {
        console.error(error);
        alert("Hashing failed: " + (error as Error).message);
    } finally {
        hashLoader.style.display = 'none';
    }
});

signBtn.addEventListener('click', async () => {
    if (!signInput.files || signInput.files.length === 0 || !signKeyInput.files || signKeyInput.files.length === 0) {
        alert("Please select both the file to sign and the .keys.json file.");
        return;
    }

    const file = signInput.files[0];
    const keyFile = signKeyInput.files[0];
    signLoader.style.display = 'inline-block';
    signStatus.style.display = 'none';

    try {
        const buffer = await file.arrayBuffer();
        const data = new Uint8Array(buffer);

        const keyText = await keyFile.text();
        const keys = JSON.parse(keyText);

        const P = BigInt(keys.p);
        const Q = BigInt(keys.q);
        const DP = BigInt(keys.dp);
        const DQ = BigInt(keys.dq);
        const QInv = BigInt(keys.qInv);

        // Sign the data
        const signature = signWithCRT(data, P, Q, DP, DQ, QInv);

        // Download the signature file
        downloadFile(signature, `${file.name}.sig`, 'text/plain');

        signStatus.style.display = 'block';
    } catch (error) {
        console.error(error);
        alert("Signing failed: " + (error as Error).message);
    } finally {
        signLoader.style.display = 'none';
    }
});

verifyBtn.addEventListener('click', async () => {
    if (!verifyInput.files || verifyInput.files.length === 0 ||
        !verifySigInput.files || verifySigInput.files.length === 0 ||
        !verifyKeyInput.files || verifyKeyInput.files.length === 0) {
        alert("Please select the original file, the .sig file, and the .keys.json file.");
        return;
    }

    const file = verifyInput.files[0];
    const sigFile = verifySigInput.files[0];
    const keyFile = verifyKeyInput.files[0];
    verifyLoader.style.display = 'inline-block';
    verifyStatus.style.display = 'none';

    try {
        const buffer = await file.arrayBuffer();
        const data = new Uint8Array(buffer);

        const signatureStr = await sigFile.text();

        const keyText = await keyFile.text();
        const keys = JSON.parse(keyText);

        const E = BigInt(keys.e);
        const N = BigInt(keys.n);

        // Verify the signature
        const isValid = verifySignature(data, signatureStr, E, N);

        verifyStatus.style.display = 'block';
        if (isValid) {
            verifyStatus.style.background = 'rgba(16, 185, 129, 0.1)';
            verifyStatus.style.color = '#10b981';
            verifyStatus.style.borderColor = 'rgba(16, 185, 129, 0.2)';
            verifyStatus.innerHTML = '✅ Signature is VALID! The file is authentic.';
        } else {
            verifyStatus.style.background = 'rgba(239, 68, 68, 0.1)';
            verifyStatus.style.color = '#ef4444';
            verifyStatus.style.borderColor = 'rgba(239, 68, 68, 0.2)';
            verifyStatus.innerHTML = '❌ Signature is INVALID! The file may have been tampered with.';
        }
    } catch (error) {
        console.error(error);
        alert("Verification failed: " + (error as Error).message);
    } finally {
        verifyLoader.style.display = 'none';
    }
});
