const isPrime = (num: number): boolean => {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;

    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }

    return true;
};

export const genRandomPrimes = (primeArray: number[]): number[] => {
    let random1: number = Math.floor(Math.random() * (primeArray.length));
    let random2: number = Math.floor(Math.random() * (primeArray.length));

    // Ensure unique primes
    while (random2 === random1) {
        random2 = Math.floor(Math.random() * (primeArray.length));
    }

    // Ensure the selected numbers are prime
    const prime1 = primeArray[random1];
    const prime2 = primeArray[random2];

    if (!isPrime(prime1) || !isPrime(prime2)) {
        throw new Error("Generated numbers are not prime");
    }

    return [prime1, prime2];
};
