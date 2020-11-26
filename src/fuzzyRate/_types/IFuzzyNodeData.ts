export type IFuzzyNodeData = {
    /** Whether the query was matched */
    matched: boolean;
    /** The distance the match is away from the query */
    distance: number;
};
