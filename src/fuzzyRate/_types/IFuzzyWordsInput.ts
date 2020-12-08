export type IFuzzyWordInput = {
    /** The word to match */
    word: string;
    /** The cost of not matching this word */
    skipPenalty?: number;
    /** How much missing a word completely should cost */
    missingPenalty?: number;
    /** How expensive making a single character typo is */
    typoPenalty?: number;
    /** The maximum allowed mistakes to still yield a match */
    maxDistance?: number;
    /** The bonus when more of these words are found */
    extraBonus?: number;
};
