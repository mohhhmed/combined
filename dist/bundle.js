"use strict";
(() => {
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });

  // src/core/bigIntUtils.ts
  var randomBigInt = (bits) => {
    const bytes = Math.ceil(bits / 8);
    let buffer;
    if (typeof window !== "undefined" && window.crypto) {
      buffer = new Uint8Array(bytes);
      window.crypto.getRandomValues(buffer);
    } else {
      try {
        const nodeCrypto = __require("crypto");
        buffer = new Uint8Array(nodeCrypto.randomBytes(bytes));
      } catch (e) {
        throw new Error("Random generation not supported in this environment.");
      }
    }
    const mask = (1 << bits % 8) - 1;
    if (mask !== 0) {
      buffer[0] &= mask;
    }
    buffer[0] |= 1 << (bits - 1) % 8;
    let result = BigInt(0);
    for (const byte of buffer) {
      result = result << BigInt(8) | BigInt(byte);
    }
    return result;
  };
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

  // src/core/genPrimeArr.ts
  var isPrimeBigInt = (n, k = 40) => {
    if (n <= BigInt(1))
      return false;
    if (n <= BigInt(3))
      return true;
    if (n % BigInt(2) === BigInt(0))
      return false;
    let d = n - BigInt(1);
    let r = BigInt(0);
    while (d % BigInt(2) === BigInt(0)) {
      d /= BigInt(2);
      r++;
    }
    for (let i = 0; i < k; i++) {
      const a = BigInt(2) + BigInt(Math.floor(Math.random() * 1e6)) % (n - BigInt(4));
      let x = modExp(a, d, n);
      if (x === BigInt(1) || x === n - BigInt(1))
        continue;
      let composite = true;
      for (let j = 0; j < Number(r) - 1; j++) {
        x = x * x % n;
        if (x === n - BigInt(1)) {
          composite = false;
          break;
        }
      }
      if (composite)
        return false;
    }
    return true;
  };

  // src/core/genRandomPrimes.ts
  var genRandomPrimes = (bitLength = 1024) => {
    const generatePrime = () => {
      while (true) {
        const p2 = randomBigInt(bitLength);
        if (p2 % BigInt(2) !== BigInt(0) && isPrimeBigInt(p2)) {
          return p2;
        }
      }
    };
    const p = generatePrime();
    let q = generatePrime();
    while (q === p) {
      q = generatePrime();
    }
    return [p, q];
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
  var generateE = (phiN) => {
    let attempts = 0;
    while (attempts < 1e3) {
      let e = randomBigInt(64) % (phiN - BigInt(3)) + BigInt(3);
      if (e % BigInt(2) === BigInt(0))
        e += BigInt(1);
      if (gcd(e, phiN) === BigInt(1)) {
        return e;
      }
      attempts++;
    }
    let fallbackE = BigInt(65537);
    while (fallbackE < phiN) {
      if (gcd(fallbackE, phiN) === BigInt(1))
        return fallbackE;
      fallbackE += BigInt(2);
    }
    throw new Error("Could not find a valid E");
  };

  // src/core/generateD.ts
  var extendedEuclidean = (a, b) => {
    if (b === BigInt(0)) {
      return [a, BigInt(1), BigInt(0)];
    }
    const [gcd2, x1, y1] = extendedEuclidean(b, a % b);
    const x = y1;
    const y = x1 - a / b * y1;
    return [gcd2, x, y];
  };

  // src/lib/encryptor.ts
  var modExp2 = (base, exponent, mod) => {
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
      const c = modExp2(m, E, N);
      encryptedChunks.push(c);
    }
    return encryptedChunks;
  };

  // src/lib/decryptor.ts
  var modExp3 = (base, exponent, mod) => {
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
  var decryptBinaryCRT = (encryptedChunks, P, Q, DP, DQ, QInv, originalLength) => {
    const bitLength = (P * Q).toString(2).length;
    const byteLength = Math.floor((bitLength - 1) / 8);
    const decryptedBytes = [];
    for (let i = 0; i < encryptedChunks.length; i++) {
      const c = encryptedChunks[i];
      const mp = modExp3(c, DP, P);
      const mq = modExp3(c, DQ, Q);
      let h = QInv * (mp - mq) % P;
      if (h < BigInt(0))
        h += P;
      let m = mq + h * Q;
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

  // src/lib/sha256.ts
  var K = new Uint32Array([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  function rotr(x, n) {
    return x >>> n | x << 32 - n;
  }
  function ch(x, y, z) {
    return x & y ^ ~x & z;
  }
  function maj(x, y, z) {
    return x & y ^ x & z ^ y & z;
  }
  function ep0(x) {
    return rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
  }
  function ep1(x) {
    return rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
  }
  function sig0(x) {
    return rotr(x, 7) ^ rotr(x, 18) ^ x >>> 3;
  }
  function sig1(x) {
    return rotr(x, 17) ^ rotr(x, 19) ^ x >>> 10;
  }
  var SHA256 = class {
    constructor() {
      this.data = new Uint8Array(64);
      this.datalen = 0;
      this.bitlen = 0;
      this.state = new Uint32Array([
        1779033703,
        3144134277,
        1013904242,
        2773480762,
        1359893119,
        2600822924,
        528734635,
        1541459225
      ]);
      this.m = new Uint32Array(64);
    }
    transform(data, offset) {
      let i, j, t1, t2;
      let a = this.state[0];
      let b = this.state[1];
      let c = this.state[2];
      let d = this.state[3];
      let e = this.state[4];
      let f = this.state[5];
      let g = this.state[6];
      let h = this.state[7];
      for (i = 0, j = offset; i < 16; ++i, j += 4) {
        this.m[i] = data[j] << 24 | data[j + 1] << 16 | data[j + 2] << 8 | data[j + 3];
      }
      for (; i < 64; ++i) {
        this.m[i] = sig1(this.m[i - 2]) + this.m[i - 7] + sig0(this.m[i - 15]) + this.m[i - 16] >>> 0;
      }
      for (i = 0; i < 64; ++i) {
        t1 = h + ep1(e) + ch(e, f, g) + K[i] + this.m[i] >>> 0;
        t2 = ep0(a) + maj(a, b, c) >>> 0;
        h = g;
        g = f;
        f = e;
        e = d + t1 >>> 0;
        d = c;
        c = b;
        b = a;
        a = t1 + t2 >>> 0;
      }
      this.state[0] = this.state[0] + a >>> 0;
      this.state[1] = this.state[1] + b >>> 0;
      this.state[2] = this.state[2] + c >>> 0;
      this.state[3] = this.state[3] + d >>> 0;
      this.state[4] = this.state[4] + e >>> 0;
      this.state[5] = this.state[5] + f >>> 0;
      this.state[6] = this.state[6] + g >>> 0;
      this.state[7] = this.state[7] + h >>> 0;
    }
    update(data) {
      for (let i = 0; i < data.length; ++i) {
        this.data[this.datalen] = data[i];
        this.datalen++;
        if (this.datalen === 64) {
          this.transform(this.data, 0);
          this.bitlen += 512;
          this.datalen = 0;
        }
      }
    }
    final() {
      let i = this.datalen;
      if (this.datalen < 56) {
        this.data[i++] = 128;
        while (i < 56) {
          this.data[i++] = 0;
        }
      } else {
        this.data[i++] = 128;
        while (i < 64) {
          this.data[i++] = 0;
        }
        this.transform(this.data, 0);
        this.data.fill(0, 0, 56);
      }
      this.bitlen += this.datalen * 8;
      const bitlenLow = this.bitlen >>> 0;
      const bitlenHigh = Math.floor(this.bitlen / 4294967296) >>> 0;
      this.data[63] = bitlenLow;
      this.data[62] = bitlenLow >>> 8;
      this.data[61] = bitlenLow >>> 16;
      this.data[60] = bitlenLow >>> 24;
      this.data[59] = bitlenHigh;
      this.data[58] = bitlenHigh >>> 8;
      this.data[57] = bitlenHigh >>> 16;
      this.data[56] = bitlenHigh >>> 24;
      this.transform(this.data, 0);
      const hash = new Uint8Array(32);
      for (let j = 0; j < 4; ++j) {
        hash[j] = this.state[0] >>> 24 - j * 8 & 255;
        hash[j + 4] = this.state[1] >>> 24 - j * 8 & 255;
        hash[j + 8] = this.state[2] >>> 24 - j * 8 & 255;
        hash[j + 12] = this.state[3] >>> 24 - j * 8 & 255;
        hash[j + 16] = this.state[4] >>> 24 - j * 8 & 255;
        hash[j + 20] = this.state[5] >>> 24 - j * 8 & 255;
        hash[j + 24] = this.state[6] >>> 24 - j * 8 & 255;
        hash[j + 28] = this.state[7] >>> 24 - j * 8 & 255;
      }
      return hash;
    }
  };
  function sha256(data) {
    const context = new SHA256();
    context.update(data);
    return context.final();
  }

  // src/lib/signature.ts
  var signWithCRT = (data, P, Q, DP, DQ, QInv) => {
    const hashBytes = sha256(data);
    let m = BigInt(0);
    for (let i = 0; i < hashBytes.length; i++) {
      m = m << BigInt(8) | BigInt(hashBytes[i]);
    }
    const sp = modExp3(m, DP, P);
    const sq = modExp3(m, DQ, Q);
    let h = QInv * (sp - sq) % P;
    if (h < BigInt(0))
      h += P;
    const s = sq + h * Q;
    return s.toString();
  };

  // src/lib/verify.ts
  var verifySignature = (data, signatureStr, E, N) => {
    try {
      const signature = BigInt(signatureStr);
      const expectedHashBytes = sha256(data);
      let expectedM = BigInt(0);
      for (let i = 0; i < expectedHashBytes.length; i++) {
        expectedM = expectedM << BigInt(8) | BigInt(expectedHashBytes[i]);
      }
      const actualM = modExp2(signature, E, N);
      return expectedM === actualM;
    } catch (e) {
      return false;
    }
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
  var hashInput = document.getElementById("hashInput");
  var hashBtn = document.getElementById("hashBtn");
  var hashOutput = document.getElementById("hashOutput");
  var hashLoader = document.getElementById("hashLoader");
  var signInput = document.getElementById("signInput");
  var signKeyInput = document.getElementById("signKeyInput");
  var signBtn = document.getElementById("signBtn");
  var signStatus = document.getElementById("signStatus");
  var signLoader = document.getElementById("signLoader");
  var verifyInput = document.getElementById("verifyInput");
  var verifySigInput = document.getElementById("verifySigInput");
  var verifyKeyInput = document.getElementById("verifyKeyInput");
  var verifyBtn = document.getElementById("verifyBtn");
  var verifyStatus = document.getElementById("verifyStatus");
  var verifyLoader = document.getElementById("verifyLoader");
  function downloadFile(data, filename, type) {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
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
      console.log("Generating RSA-2048 Keys...");
      const [p, q] = genRandomPrimes(1024);
      const n = p * q;
      const phiN = (p - BigInt(1)) * (q - BigInt(1));
      const e = generateE(phiN);
      const [gcdE, dValue, _] = extendedEuclidean(e, phiN);
      if (gcdE !== BigInt(1))
        throw new Error("e and phiN are not coprime");
      const d = (dValue % phiN + phiN) % phiN;
      const dp = d % (p - BigInt(1));
      const dq = d % (q - BigInt(1));
      const [gcdQ, qInvValue, _q] = extendedEuclidean(q, p);
      if (gcdQ !== BigInt(1))
        throw new Error("q and p are not coprime");
      const qInv = (qInvValue % p + p) % p;
      const encryptedChunks = encryptBinary(data, e, n);
      const encryptedBlob = JSON.stringify(
        encryptedChunks,
        (key, value) => typeof value === "bigint" ? value.toString() : value
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
      downloadFile(encryptedBlob, `${file.name}.enc`, "application/json");
      downloadFile(keysMetadata, `${file.name}.keys.json`, "application/json");
      encryptStatus.style.display = "block";
      keysDisplay.style.display = "block";
      keysDisplay.innerHTML = `<strong>RSA-2048 Keys Generated:</strong><br>Modulus N (2048-bit) and Public Exponent E (65537) used.<br>JSON key file downloaded.`;
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
      const keys = JSON.parse(keyText);
      const encryptedChunks = encryptedData.map((s) => BigInt(s));
      const p_file = BigInt(keys.p);
      const q_file = BigInt(keys.q);
      const dp_file = BigInt(keys.dp);
      const dq_file = BigInt(keys.dq);
      const qInv_file = BigInt(keys.qInv);
      const originalLength = keys.originalLength;
      const originalName = keys.originalName || "restored_file";
      const decryptedData = decryptBinaryCRT(
        encryptedChunks,
        p_file,
        q_file,
        dp_file,
        dq_file,
        qInv_file,
        originalLength
      );
      downloadFile(decryptedData, `restored_${originalName}`, "application/octet-stream");
      decryptStatus.style.display = "block";
    } catch (error) {
      console.error(error);
      alert("Decryption failed: " + error.message);
    } finally {
      decryptLoader.style.display = "none";
    }
  });
  hashBtn.addEventListener("click", async () => {
    if (!hashInput.files || hashInput.files.length === 0) {
      alert("Please select a file to hash.");
      return;
    }
    const file = hashInput.files[0];
    hashLoader.style.display = "inline-block";
    hashOutput.style.display = "none";
    try {
      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);
      const hashArray = sha256(data);
      const hashHex = Array.from(hashArray).map((b) => b.toString(16).padStart(2, "0")).join("");
      hashOutput.style.display = "block";
      hashOutput.innerHTML = `<strong>SHA-256 Hash:</strong><br>${hashHex}`;
    } catch (error) {
      console.error(error);
      alert("Hashing failed: " + error.message);
    } finally {
      hashLoader.style.display = "none";
    }
  });
  signBtn.addEventListener("click", async () => {
    if (!signInput.files || signInput.files.length === 0 || !signKeyInput.files || signKeyInput.files.length === 0) {
      alert("Please select both the file to sign and the .keys.json file.");
      return;
    }
    const file = signInput.files[0];
    const keyFile = signKeyInput.files[0];
    signLoader.style.display = "inline-block";
    signStatus.style.display = "none";
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
      const signature = signWithCRT(data, P, Q, DP, DQ, QInv);
      downloadFile(signature, `${file.name}.sig`, "text/plain");
      signStatus.style.display = "block";
    } catch (error) {
      console.error(error);
      alert("Signing failed: " + error.message);
    } finally {
      signLoader.style.display = "none";
    }
  });
  verifyBtn.addEventListener("click", async () => {
    if (!verifyInput.files || verifyInput.files.length === 0 || !verifySigInput.files || verifySigInput.files.length === 0 || !verifyKeyInput.files || verifyKeyInput.files.length === 0) {
      alert("Please select the original file, the .sig file, and the .keys.json file.");
      return;
    }
    const file = verifyInput.files[0];
    const sigFile = verifySigInput.files[0];
    const keyFile = verifyKeyInput.files[0];
    verifyLoader.style.display = "inline-block";
    verifyStatus.style.display = "none";
    try {
      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);
      const signatureStr = await sigFile.text();
      const keyText = await keyFile.text();
      const keys = JSON.parse(keyText);
      const E = BigInt(keys.e);
      const N = BigInt(keys.n);
      const isValid = verifySignature(data, signatureStr, E, N);
      verifyStatus.style.display = "block";
      if (isValid) {
        verifyStatus.style.background = "rgba(16, 185, 129, 0.1)";
        verifyStatus.style.color = "#10b981";
        verifyStatus.style.borderColor = "rgba(16, 185, 129, 0.2)";
        verifyStatus.innerHTML = "\u2705 Signature is VALID! The file is authentic.";
      } else {
        verifyStatus.style.background = "rgba(239, 68, 68, 0.1)";
        verifyStatus.style.color = "#ef4444";
        verifyStatus.style.borderColor = "rgba(239, 68, 68, 0.2)";
        verifyStatus.innerHTML = "\u274C Signature is INVALID! The file may have been tampered with.";
      }
    } catch (error) {
      console.error(error);
      alert("Verification failed: " + error.message);
    } finally {
      verifyLoader.style.display = "none";
    }
  });
})();
