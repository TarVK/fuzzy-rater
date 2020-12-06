export type IFuzzyRateConfig = {
    /**
     * A map of minLength, maxDistance pairs,
     * such that for a string of minLength at most maxDistance mistakes are allowed
     */
    fuzziness?: Record<number, number>;
    /** How much missing a word (or having it out of order) should cost (defaults to 10) */
    skipPenalty?: number;
    /** How much missing a word completely should cost (defaults to 50)*/
    missingPenalty?: number;
    /** How expensive making a single character typo is (defaults to 100) */
    typoPenalty?: number;
    /** The bonus when more of the query words are found (defaults to 5) */
    extraBonus?: number;
};
