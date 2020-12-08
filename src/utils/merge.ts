/**
 * Adds a value to the given array, using array.push disguised as an immutable operation.
 * This allows for the inline style of merging arrays, while only taking constant time instead of linear time,
 * at the cost of higher potential of mistakes.
 * @param a The array to add to
 * @param b The value to be added
 * @returns The array with the value added
 */
export function add<T>(a: T[], b: T): T[] {
    a.push(b);
    return a;
}

/**
 * Adds a value to the given array, using array.push disguised as an immutable operation
 * This allows for the inline style of merging arrays, while only taking constant time (for fixed b) instead of linear time,
 * at the cost of higher potential of mistakes.
 * @param a The array to add to
 * @param b The values to be added
 * @returns The array with the value added
 */
export function merge<T>(a: T[], b: T[]): T[] {
    a.push(...b);
    return a;
}
