import { gcd } from './gcd';

export const generateE = (N: number, phiN: number): number => {
    const generateAndCheckE = (): number | null => {
        let findE = Math.floor(Math.random() * (phiN - 2) + 2);

        // Start looking for a valid E from the generated findE downwards
        while (findE > 2) {
            if (gcd(findE, N) === 1 && gcd(findE, phiN) === 1) {
                return findE;
            }
            findE--;
        }

        // If we exit the loop, it means no valid E was found
        return null;
    };

    // Keep trying to generate E until a valid one is found
    let E: number | null = null;
    while (E === null) {
        E = generateAndCheckE();
    }

    return E;
};
