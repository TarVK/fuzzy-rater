export type IWordOrderMatchInput = {
    /** The word that was matched */
    word: string;
    /** The start index of the word */
    index: number;
    /** The end index of the word */
    endIndex: number;
    /** The extra cost associated with this word */
    cost: number;
};
