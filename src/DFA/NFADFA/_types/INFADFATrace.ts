import {INormalizedNFANode} from "../../../NFA/_types/INormalizedNFANode";
import {IAugmentedNFATransition} from "./INFADFATransitionData";

/**
 * A trace that can be found in a NFA DFA instance
 */
export type INFADFATrace<N, T> = {
    final: N;
    /**
     * Retrieves the path/trace
     * @param chooseTransition A function that can be used to decide what transition to follow
     */
    getPath(
        chooseTransition?: (
            /** The node that the transition goes through */
            to: INormalizedNFANode<N, T>,
            /** THe possible transitions */
            transitions: IAugmentedNFATransition<T>[],
            /** A map of nodes that can be used to make the choice */
            allNodes: Record<string, INormalizedNFANode<N, T>>
        ) => IAugmentedNFATransition<T> | undefined
    ): {node: N; transition: T}[];
};
