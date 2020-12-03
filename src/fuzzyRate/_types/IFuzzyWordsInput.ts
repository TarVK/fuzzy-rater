export type IFuzzyWordInput = {
    /** The word to match */
    word: string;
    /** The cost of not matching this word */
    skipPenalty?: number;
    /** The maximum allowed mistakes to still yield a match */
    maxDistance?: number;
    /** The bonus when more of these words are found */
    extraBonus?: number;
};
