const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

function rotr(x: number, n: number): number {
    return (x >>> n) | (x << (32 - n));
}

function ch(x: number, y: number, z: number): number {
    return (x & y) ^ (~x & z);
}

function maj(x: number, y: number, z: number): number {
    return (x & y) ^ (x & z) ^ (y & z);
}

function ep0(x: number): number {
    return rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
}

function ep1(x: number): number {
    return rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
}

function sig0(x: number): number {
    return rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
}

function sig1(x: number): number {
    return rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10);
}

export class SHA256 {
    private data = new Uint8Array(64);
    private datalen = 0;
    private bitlen = 0;
    private state = new Uint32Array([
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ]);
    private m = new Uint32Array(64);

    private transform(data: Uint8Array, offset: number) {
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
            this.m[i] = (data[j] << 24) | (data[j + 1] << 16) | (data[j + 2] << 8) | data[j + 3];
        }
        for (; i < 64; ++i) {
            this.m[i] = (sig1(this.m[i - 2]) + this.m[i - 7] + sig0(this.m[i - 15]) + this.m[i - 16]) >>> 0;
        }

        for (i = 0; i < 64; ++i) {
            t1 = (h + ep1(e) + ch(e, f, g) + K[i] + this.m[i]) >>> 0;
            t2 = (ep0(a) + maj(a, b, c)) >>> 0;
            h = g;
            g = f;
            f = e;
            e = (d + t1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (t1 + t2) >>> 0;
        }

        this.state[0] = (this.state[0] + a) >>> 0;
        this.state[1] = (this.state[1] + b) >>> 0;
        this.state[2] = (this.state[2] + c) >>> 0;
        this.state[3] = (this.state[3] + d) >>> 0;
        this.state[4] = (this.state[4] + e) >>> 0;
        this.state[5] = (this.state[5] + f) >>> 0;
        this.state[6] = (this.state[6] + g) >>> 0;
        this.state[7] = (this.state[7] + h) >>> 0;
    }

    public update(data: Uint8Array) {
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

    public final(): Uint8Array {
        let i = this.datalen;

        if (this.datalen < 56) {
            this.data[i++] = 0x80;
            while (i < 56) {
                this.data[i++] = 0x00;
            }
        } else {
            this.data[i++] = 0x80;
            while (i < 64) {
                this.data[i++] = 0x00;
            }
            this.transform(this.data, 0);
            this.data.fill(0, 0, 56);
        }

        this.bitlen += this.datalen * 8;

        const bitlenLow = this.bitlen >>> 0;
        const bitlenHigh = Math.floor(this.bitlen / 0x100000000) >>> 0;

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
            hash[j] = (this.state[0] >>> (24 - j * 8)) & 0xff;
            hash[j + 4] = (this.state[1] >>> (24 - j * 8)) & 0xff;
            hash[j + 8] = (this.state[2] >>> (24 - j * 8)) & 0xff;
            hash[j + 12] = (this.state[3] >>> (24 - j * 8)) & 0xff;
            hash[j + 16] = (this.state[4] >>> (24 - j * 8)) & 0xff;
            hash[j + 20] = (this.state[5] >>> (24 - j * 8)) & 0xff;
            hash[j + 24] = (this.state[6] >>> (24 - j * 8)) & 0xff;
            hash[j + 28] = (this.state[7] >>> (24 - j * 8)) & 0xff;
        }

        return hash;
    }
}

export function sha256(data: Uint8Array): Uint8Array {
    const context = new SHA256();
    context.update(data);
    return context.final();
}
