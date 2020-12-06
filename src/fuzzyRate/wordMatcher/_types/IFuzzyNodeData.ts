export type IFuzzyNodeData = {
    /** Whether the query was matched */
    matched: boolean;
    /** The distance the match is away from the query */
    distance: number;
};

/**
 * The node data, including how far the search got
 */
export type IExtendedFuzzyNodeData = IFuzzyNodeData & {
    /** How far along the search characters the search got */
    searchIndex: number;
};
