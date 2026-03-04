export const gcd = (a: number, b: number): number => {
    if (!b) {
        return a;
    }
    let aModB: number = a % b;
    return gcd(b, aModB);
};
