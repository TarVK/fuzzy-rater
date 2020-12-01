export type IWordOrderNode = {
    /** The character distance so far */
    distance: number;
    /** Whether this match just decided to skip a query word, used to more easily retrace the best path later */
    skippedWord: boolean;
    /** The last index of the previous matched word */
    lastIndex: number;
};
