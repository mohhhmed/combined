# RSA Binary Cryptosystem 

This project is a standalone RSA engine that can encrypt and decrypt **any type of data** (files, images, binaries) using pure mathematical RSA logic. 


##  Features
- **File Encryption**: Encrypt any file (image, pdf, exe, etc.) into a `.enc` file.
- **Bit-Perfect Restoration**: Decryption results in a 100% identical copy of the original file (verified by SHA256 hashes).
- **Core RSA Math**: Uses the standard RSA algorithm ($M^E \pmod N$ and $C^D \pmod N$) with `BigInt` for high precision.
- **Headless**: Runs directly in Node.js/TypeScript without any browser requirements.

##  Architecture
- `src/core/`: Contains the fundamental math logic (GCD, Extended Euclidean, Prime Generation, Key Generation).
- `src/lib/binaryCipher.ts`: Implements data chunking and the binary-to-math conversion layer.
- `src/index.ts`: The CLI utility for easy file operations.

##  Installation
1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

##  Usage

### Encrypt a File
```bash
npx ts-node src/index.ts encrypt <path_to_file>
```
This will generate:
1. `<filename>.enc`: The encrypted data.
2. `<filename>.keys.json`: The generated Public (E, N) and Private (D) keys required for decryption.

### Decrypt a File
```bash
npx ts-node src/index.ts decrypt <path_to_file>.enc
```
This will look for the corresponding `.keys.json` and generate:
1. `<filename>.dec`: The restored original file.

##  Mathematical Concept
This implementation strictly follows the RSA concept:
- **Key Generation**: 
  - Choose two large primes $p$ and $q$.
  - $n = p \times q$
  - $\phi(n) = (p-1)(q-1)$
  - Choose $E$ such that $gcd(E, \phi(n)) = 1$.
  - Calculate $D$ such that $E \times D \equiv 1 \pmod{\phi(n)}$.
- **Encryption**: $C = M^E \pmod N$
- **Decryption (CRT Optimized)**: 
  Instead of the slow $M = C^D \pmod N$, we use the **Chinese Remainder Theorem**:
  1. **Precompute**: $d_p, d_q$, and $q_{inv}$ (stored in private key).
  2. **Partial Decryption**: 
     - $m_p = C^{d_p} \pmod p$
     - $m_q = C^{d_q} \pmod q$
  3. **Reconstruct**: Use Garner's formula to combine $m_p$ and $m_q$ into the final message $M$.
  This method is mathematically identical but **~4x faster** in practice.

Data is processed in chunks smaller than $N$ to ensure mathematical validity.

##  Testing with my-react-app
The frontend is built with React and integrated with the core RSA logic located in `src/core`.

### Steps to Run the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd my-react-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser (usually `http://localhost:5173`).

### How to Test the Cryptographic Flow
1. **Register/Login**: Creating a new account generates two unique RSA-2048 key pairs with full CRT parameters.
2. **Secure Upload**: 
   - Select a file to "Upload".
   - The app uses `src/core` to encrypt and sign the data.
   - A `.rsa.json` bundle is automatically saved to your **Desktop**.
3. **Secure Download**: 
   - Click the "Download" icon in the list.
   - The app verifies the signature and uses the CRT-optimized decryption from `src/core` to restore the original file.
4. **Verification**: Check your browser console (F12) to see the step-by-step cryptographic logs!
