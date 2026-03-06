export const extendedEuclidean = (a: bigint, b: bigint): [bigint, bigint, bigint] => {
    if (b === BigInt(0)) {
        return [a, BigInt(1), BigInt(0)];
    }
    const [gcd, x1, y1] = extendedEuclidean(b, a % b);
    const x = y1;
    const y = x1 - (a / b) * y1;
    return [gcd, x, y];
};

export const generateD = (phiN: bigint, E: bigint): bigint => {
    const [gcdValue, x, _] = extendedEuclidean(E, phiN);

    // Ensure E and phiN are coprime
    if (gcdValue !== BigInt(1)) {
        throw new Error("E and phiN are not coprime, failed to generate D");
    }

    let D = x % phiN;
    if (D < BigInt(0)) {
        D += phiN;  // Ensure D is positive
    }

    return D;
};
