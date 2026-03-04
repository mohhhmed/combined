import { genPrimeArr } from './core/genPrimeArr';
import { genRandomPrimes } from './core/genRandomPrimes';
import { generateE } from './core/generateE';
import { generateD } from './core/generateD';
import { encryptBinary, decryptBinary } from './lib/binaryCipher';

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

// Helper to trigger file download
function downloadFile(data: any, filename: string, type: string) {
    const blob = new Blob([data], { type: type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
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
        // Read file as ArrayBuffer
        const buffer = await file.arrayBuffer();
        const data = new Uint8Array(buffer);

        // RSA Key Generation (Math Core)
        // Using a reasonable prime array size for browser speed
        const primeArr = genPrimeArr(104729);
        const [p, q] = genRandomPrimes(primeArr);
        const n = BigInt(p) * BigInt(q);
        const phiN = BigInt(p - 1) * BigInt(q - 1);
        const e = BigInt(generateE(Number(n), Number(phiN)));
        const d = BigInt(generateD(Number(phiN), Number(e)));

        // Encrypt (Logic Core)
        const encryptedChunks = encryptBinary(data, e, n);

        // Prepare outputs
        const encryptedBlob = JSON.stringify(encryptedChunks, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        );
        const keysMetadata = JSON.stringify({
            e: e.toString(),
            d: d.toString(),
            n: n.toString(),
            originalLength: data.length,
            originalName: file.name
        }, null, 2);

        // Download results
        downloadFile(encryptedBlob, `${file.name}.enc`, 'application/json');
        downloadFile(keysMetadata, `${file.name}.keys.json`, 'application/json');

        encryptStatus.style.display = 'block';
        keysDisplay.style.display = 'block';
        keysDisplay.innerHTML = `<strong>Keys Generated:</strong><br>E: ${e}<br>N: ${n}<br>D: ${d}`;

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
        // Read files
        const encText = await encFile.text();
        const keyText = await keyFile.text();

        const encryptedData: string[] = JSON.parse(encText);
        const metadata = JSON.parse(keyText);

        const encryptedChunks = encryptedData.map(s => BigInt(s));
        const d = BigInt(metadata.d);
        const n = BigInt(metadata.n);
        const originalLength = metadata.originalLength;
        const originalName = metadata.originalName || 'restored_file';

        // Decrypt (Logic Core)
        const decryptedData = decryptBinary(encryptedChunks, d, n, originalLength);

        // Download result
        downloadFile(decryptedData, `restored_${originalName}`, 'application/octet-stream');

        decryptStatus.style.display = 'block';

    } catch (error) {
        console.error(error);
        alert("Decryption failed: " + (error as Error).message);
    } finally {
        decryptLoader.style.display = 'none';
    }
});
