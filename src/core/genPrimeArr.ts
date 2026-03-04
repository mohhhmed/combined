export const genPrimeArr = (upperBound: number = 149): number[] => {
    let primeArr: number[] = [];

    const isPrime = (n: number): boolean => {
        if (n < 2) return false;
        for (let i = 2; i <= Math.sqrt(n); i++) {
            if (n % i === 0) return false;
        }
        return true;
    };

    if (upperBound < 11) {
        throw new Error("Invalid input. Upper bound must be greater than or equal to 11.");
    }

    if (!isPrime(upperBound)) {
        // Find nearest prime less than upperBound
        let nearestPrime = -1;
        for (let i = upperBound - 1; i >= 2; i--) {
            if (isPrime(i)) {
                nearestPrime = i;
                break;
            }
        }
        throw new Error(`The number ${upperBound} is not prime. The nearest prime less than ${upperBound} is ${nearestPrime}.`);
    }

    for (let n = 11; n <= upperBound; n++) {
        if (isPrime(n)) {
            primeArr.push(n);
        }
    }

    return primeArr;
};
