export type IWordOrderQueryWordInput = {
    /** The word to be matched */
    word: string;
    /**
     * How bad missing 1 word from the match is, in comparison to words being `penalty` characters apart
     * - penalty = Infinity: always prefer having all words present in sequence, no matter how far apart
     * - penalty = 0: always prefer having consecutive words, no matter if words are missing
     */
    penalty: number;
};
