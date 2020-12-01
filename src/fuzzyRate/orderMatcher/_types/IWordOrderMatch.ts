import {IWordOrderMatchInput} from "./IWordOrderMatchInput";

export type IWordOrderMatch = {
    /** The index of the word in the query input array */
    wordIndex: number;
    /** The index of the match from the input array */
    matchIndex: number;
    /** The match from the input array */
    match: IWordOrderMatchInput;
};
