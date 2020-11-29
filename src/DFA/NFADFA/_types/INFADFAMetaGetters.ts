import {INormalizedNFATransition} from "../../../NFA/_types/INormalizedNFATransition";
import {INormalizedNFANode} from "../../../NFA/_types/INormalizedNFANode";

export type INFADFAMetaGetters<N, T, CN, CT> = {
    /**
     * Retrieves the combined/reduced metadata for a given set of NFA nodes
     * @param sources The source nodes to get the combined metadata for
     * @returns The combined metadata
     **/
    nodeMeta: (sources: INormalizedNFANode<N, T>[]) => CN;
    /**
     * Retrieves the combined/reduced metadata for a given set of NFA transitions
     * @param sources The source transitions to get the combined metadata for
     * @returns The combined metadata
     **/
    transitionMeta: (sources: INormalizedNFATransition<T>[]) => CT;
};
