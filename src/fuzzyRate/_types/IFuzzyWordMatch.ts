export type IFuzzyWordMatch = {
    /**
     * The type of transition
     * - insert: Matches a character that wasn't in the query
     * - skip: Skips a character that was in the query
     * - match: Matches a character in the text with the character in the query
     * - replace: Replaces a query character for another character
     * - ignore: Any text before or after a query match
     */
    type: "insert" | "skip" | "match" | "replace" | "ignore";
    /** The data specified in the query */
    query: {
        character: string;
        index: number;
    };
    /** The data specified in the target */
    target: {
        character: string;
        index: number;
    };
};
