import {INormalizedNFATransition} from "./INormalizedNFATransition";

/**
 * A non-deterministic finite automaton node
 */
export type INormalizedNFANode<N, T> = {
    /** The ID of this node */
    ID: string;
    /** The transitions from this node */
    transitions: INormalizedNFATransition<T>[];
    /** Whether this is an initial state */
    initial?: boolean;
    /* Any extra metadata to attach to the node */
    metadata: N;
};
