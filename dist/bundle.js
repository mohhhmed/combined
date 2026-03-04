"use strict";
(() => {
  // src/core/genPrimeArr.ts
  var genPrimeArr = (upperBound = 149) => {
    let primeArr = [];
    const isPrime2 = (n) => {
      if (n < 2)
        return false;
      for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0)
          return false;
      }
      return true;
    };
    if (upperBound < 11) {
      throw new Error("Invalid input. Upper bound must be greater than or equal to 11.");
    }
    if (!isPrime2(upperBound)) {
      let nearestPrime = -1;
      for (let i = upperBound - 1; i >= 2; i--) {
        if (isPrime2(i)) {
          nearestPrime = i;
          break;
        }
      }
      throw new Error(`The number ${upperBound} is not prime. The nearest prime less than ${upperBound} is ${nearestPrime}.`);
    }
    for (let n = 11; n <= upperBound; n++) {
      if (isPrime2(n)) {
        primeArr.push(n);
      }
    }
    return primeArr;
  };

  // src/core/genRandomPrimes.ts
  var isPrime = (num) => {
    if (num <= 1)
      return false;
    if (num <= 3)
      return true;
    if (num % 2 === 0 || num % 3 === 0)
      return false;
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0)
        return false;
    }
    return true;
  };
  var genRandomPrimes = (primeArray) => {
    let random1 = Math.floor(Math.random() * primeArray.length);
    let random2 = Math.floor(Math.random() * primeArray.length);
    while (random2 === random1) {
      random2 = Math.floor(Math.random() * primeArray.length);
    }
    const prime1 = primeArray[random1];
    const prime2 = primeArray[random2];
    if (!isPrime(prime1) || !isPrime(prime2)) {
      throw new Error("Generated numbers are not prime");
    }
    return [prime1, prime2];
  };

  // src/core/gcd.ts
  var gcd = (a, b) => {
    if (!b) {
      return a;
    }
    let aModB = a % b;
    return gcd(b, aModB);
  };

  // src/core/generateE.ts
  var generateE = (N, phiN) => {
    const generateAndCheckE = () => {
      let findE = Math.floor(Math.random() * (phiN - 2) + 2);
      while (findE > 2) {
        if (gcd(findE, N) === 1 && gcd(findE, phiN) === 1) {
          return findE;
        }
        findE--;
      }
      return null;
    };
    let E = null;
    while (E === null) {
      E = generateAndCheckE();
    }
    return E;
  };

  // src/core/generateD.ts
  var extendedEuclidean = (a, b) => {
    if (b === 0) {
      return [a, 1, 0];
    }
    const [gcd2, x1, y1] = extendedEuclidean(b, a % b);
    const x = y1;
    const y = x1 - Math.floor(a / b) * y1;
    return [gcd2, x, y];
  };
  var generateD = (phiN, E) => {
    const [gcd2, x, _] = extendedEuclidean(E, phiN);
    if (gcd2 !== 1) {
      throw new Error("E and phiN are not coprime, failed to generate D");
    }
    let D = x % phiN;
    if (D < 0) {
      D += phiN;
    }
    return D;
  };

  // src/lib/binaryCipher.ts
  var modExp = (base, exponent, mod) => {
    let result = BigInt(1);
    base = base % mod;
    while (exponent > BigInt(0)) {
      if (exponent % BigInt(2) === BigInt(1)) {
        result = result * base % mod;
      }
      exponent = exponent >> BigInt(1);
      base = base * base % mod;
    }
    return result;
  };
  var encryptBinary = (data, E, N) => {
    const bitLength = N.toString(2).length;
    const byteLength = Math.floor((bitLength - 1) / 8);
    if (byteLength < 1) {
      throw new Error("Modulus N is too small for binary encryption. Use larger primes.");
    }
    const encryptedChunks = [];
    for (let i = 0; i < data.length; i += byteLength) {
      const chunk = data.slice(i, i + byteLength);
      let m = BigInt(0);
      for (let j = 0; j < chunk.length; j++) {
        m = m << BigInt(8) | BigInt(chunk[j]);
      }
      const c = modExp(m, E, N);
      encryptedChunks.push(c);
    }
    return encryptedChunks;
  };
  var decryptBinary = (encryptedChunks, D, N, originalLength) => {
    const bitLength = N.toString(2).length;
    const byteLength = Math.floor((bitLength - 1) / 8);
    const decryptedBytes = [];
    for (let i = 0; i < encryptedChunks.length; i++) {
      let m = modExp(encryptedChunks[i], D, N);
      const chunkBytes = [];
      for (let j = 0; j < byteLength; j++) {
        chunkBytes.unshift(Number(m & BigInt(255)));
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

  // src/browser_app.ts
  var encryptInput = document.getElementById("encryptInput");
  var encryptBtn = document.getElementById("encryptBtn");
  var encryptStatus = document.getElementById("encryptStatus");
  var keysDisplay = document.getElementById("keysDisplay");
  var encryptLoader = document.getElementById("encryptLoader");
  var decryptInput = document.getElementById("decryptInput");
  var keyInput = document.getElementById("keyInput");
  var decryptBtn = document.getElementById("decryptBtn");
  var decryptStatus = document.getElementById("decryptStatus");
  var decryptLoader = document.getElementById("decryptLoader");
  function downloadFile(data, filename, type) {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  encryptBtn.addEventListener("click", async () => {
    if (!encryptInput.files || encryptInput.files.length === 0) {
      alert("Please select a file to encrypt.");
      return;
    }
    const file = encryptInput.files[0];
    encryptLoader.style.display = "inline-block";
    encryptStatus.style.display = "none";
    try {
      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);
      const primeArr = genPrimeArr(104729);
      const [p, q] = genRandomPrimes(primeArr);
      const n = BigInt(p) * BigInt(q);
      const phiN = BigInt(p - 1) * BigInt(q - 1);
      const e = BigInt(generateE(Number(n), Number(phiN)));
      const d = BigInt(generateD(Number(phiN), Number(e)));
      const encryptedChunks = encryptBinary(data, e, n);
      const encryptedBlob = JSON.stringify(
        encryptedChunks,
        (key, value) => typeof value === "bigint" ? value.toString() : value
      );
      const keysMetadata = JSON.stringify({
        e: e.toString(),
        d: d.toString(),
        n: n.toString(),
        originalLength: data.length,
        originalName: file.name
      }, null, 2);
      downloadFile(encryptedBlob, `${file.name}.enc`, "application/json");
      downloadFile(keysMetadata, `${file.name}.keys.json`, "application/json");
      encryptStatus.style.display = "block";
      keysDisplay.style.display = "block";
      keysDisplay.innerHTML = `<strong>Keys Generated:</strong><br>E: ${e}<br>N: ${n}<br>D: ${d}`;
    } catch (error) {
      console.error(error);
      alert("Encryption failed: " + error.message);
    } finally {
      encryptLoader.style.display = "none";
    }
  });
  decryptBtn.addEventListener("click", async () => {
    if (!decryptInput.files || decryptInput.files.length === 0 || !keyInput.files || keyInput.files.length === 0) {
      alert("Please select both the .enc file and the .keys.json file.");
      return;
    }
    const encFile = decryptInput.files[0];
    const keyFile = keyInput.files[0];
    decryptLoader.style.display = "inline-block";
    decryptStatus.style.display = "none";
    try {
      const encText = await encFile.text();
      const keyText = await keyFile.text();
      const encryptedData = JSON.parse(encText);
      const metadata = JSON.parse(keyText);
      const encryptedChunks = encryptedData.map((s) => BigInt(s));
      const d = BigInt(metadata.d);
      const n = BigInt(metadata.n);
      const originalLength = metadata.originalLength;
      const originalName = metadata.originalName || "restored_file";
      const decryptedData = decryptBinary(encryptedChunks, d, n, originalLength);
      downloadFile(decryptedData, `restored_${originalName}`, "application/octet-stream");
      decryptStatus.style.display = "block";
    } catch (error) {
      console.error(error);
      alert("Decryption failed: " + error.message);
    } finally {
      decryptLoader.style.display = "none";
    }
  });
})();
