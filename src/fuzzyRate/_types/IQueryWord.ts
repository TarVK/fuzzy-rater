export type IQueryWord = {
    /** The index of the word in the list of query words */
    index: number;
    /** The word itself */
    text: string;
    /** The index at which this text was matched, in the best case order match (-1 representing it not being matched) */
    matchedIndex: number;
};
