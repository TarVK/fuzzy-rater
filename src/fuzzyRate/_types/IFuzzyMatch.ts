export type IFuzzyMatch = {
    /** The cost of words completely missing */
    missingCost: number;
    /** The cost of words not being in order / far apart */
    orderCost: number;
    /** The bonus of extra matches having been found */
    extraBonus: number;
    /** The combined score (larger is worse) */
    score: number;
};
