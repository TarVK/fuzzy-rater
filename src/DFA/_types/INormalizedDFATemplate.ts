import {INormalizedDFANode} from "./INormalizedDFANode";

/** The template for a dfa */
export type INormalizedDFATemplate<N, T> = {
    /** The nodes of the template */
    nodes: INormalizedDFANode<N, T>[];
    /** The initial state */
    initial: string;
};
