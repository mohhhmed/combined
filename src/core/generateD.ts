export const extendedEuclidean = (a: number, b: number): [number, number, number] => {
    if (b === 0) {
        return [a, 1, 0];
    }
    const [gcd, x1, y1] = extendedEuclidean(b, a % b);
    const x = y1;
    const y = x1 - Math.floor(a / b) * y1;
    return [gcd, x, y];
};

export const generateD = (phiN: number, E: number): number => {
    const [gcd, x, _] = extendedEuclidean(E, phiN);

    // Ensure E and phiN are coprime
    if (gcd !== 1) {
        throw new Error("E and phiN are not coprime, failed to generate D");
    }

    let D = x % phiN;
    if (D < 0) {
        D += phiN;  // Ensure D is positive
    }

    return D;
};
