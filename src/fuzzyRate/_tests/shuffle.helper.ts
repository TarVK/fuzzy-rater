/**
 * Shuffles the given array, returning the shuffled version and its indices
 * @param array The array to be shuffled
 * @param seed The seed to perform the shuffling with
 * @returns The shuffled array and indices
 */
export function shuffleWithIndices<T>(array: T[], seed: number = 0): [T[], number[]] {
    const indiced = array.map((data, i) => [data, i] as const);
    const shuffled = shuffle(indiced);
    return [shuffled.map(([v]) => v), shuffled.map(([, i]) => i)];
}

/**
 * Shuffles the given array
 * @param array The array to be shuffled
 * @param seed The seed to perform the shuffling with
 * @returns The shuffled array
 */
export function shuffle<T>(array: T[], seed: number = 0): T[] {
    array = [...array];
    const random = LCG(seed);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Seeded random; Lehmer/Park-Miller RNG or MCG
const LCG = (s: number) => () => ((2 ** 31 - 1) & (s = Math.imul(48271, s))) / 2 ** 31;
