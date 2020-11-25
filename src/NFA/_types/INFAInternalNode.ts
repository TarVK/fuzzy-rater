import {INormalizedNFATransition} from "./INormalizedNFATransition";

export type INFAInternalNode<N, T> = {
    /** The ID of the node */
    ID: string;
    /** The available character transitions */
    charTransitions: Record<string, INormalizedNFATransition<T>[]>;
    /** The empty transitions to take */
    emptyTransitions: INormalizedNFATransition<T>[];
    /** The transitions to take if no character transition exists */
    remainingTransitions: INormalizedNFATransition<T>[];
    /** Any extra metadata to attach to the node */
    metadata: N;
};
