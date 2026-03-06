export const gcd = (a: bigint, b: bigint): bigint => {
    if (!b) {
        return a;
    }
    let aModB: bigint = a % b;
    return gcd(b, aModB);
};
