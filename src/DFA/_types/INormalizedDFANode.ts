import {INormalizedDFATransition} from "./INormalizedDFATransition";

/**
 * A deterministic finite automaton node
 */
export type INormalizedDFANode<N, T> = {
    /** The ID of this node */
    ID: string;
    /** The transitions from this node */
    transitions: INormalizedDFATransition<T>[];
    /* Any extra metadata to attach to the node */
    metadata: N;
};
