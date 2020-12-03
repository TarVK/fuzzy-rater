import {IQueryWord} from "./IQueryWord";

/** Match data that can be used for highlighting */
export type IMatchGroup = {
    /** The range of text that this data applies to */
    range: {
        /*^ The start index of the group */
        start: number;
        /*^ The end index of the group */
        end: number;
        /*^ The text of the group */
        text: string;
    };
    /** The data about how this text matches the query */
    relations: IMatchGroupRelationData[];
};

/**
 * Information about what query data this matched or mismatched
 */
export type IMatchGroupRelationData = {
    /**
     * The type of transition
     * - insert: Matches a character that wasn't in the query
     * - skip: Skips a character that was in the query
     * - match: Matches a character in the text with the character in the query
     * - replace: Replaces a query character for another character
     */
    type: "insert" | "skip" | "match" | "replace";
    /** The query word that this data is for*/
    word: IQueryWord;
    /** The range of the text on the query data */
    range: {
        /*^ The start index of the part of the query word */
        start: number;
        /*^ The end index of the part of the query word */
        end: number;
        /*^ The part of the query word */
        text: string;
    };
    /** Whether this match was part of the best match sequence */
    partOfBestOrder: boolean;
};
