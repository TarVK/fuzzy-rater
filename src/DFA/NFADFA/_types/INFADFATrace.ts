import {INormalizedNFANode} from "../../../NFA/_types/INormalizedNFANode";
import {IDFATrace} from "../../_types/IDFATrace";
import {INFADFANodeData} from "./INFADFANodeData";
import {IAugmentedNFATransition, INFADFATransitionData} from "./INFADFATransitionData";

/**
 * A trace that can be found in a NFA DFA instance
 */
export type INFADFATrace<N, T, CN = unknown, CT = unknown> = {
    final: N;
    /**
     * Retrieves the path/trace
     * @param getTransitionChooser A function that retrieves a function that can be used to decide what transition to follow
     */
    getPath(
        getTransitionChooser?: (
            /** The trace as present in the DFA */
            dfaTrace: IDFATrace<INFADFANodeData<N, T, CN>, INFADFATransitionData<T, CT>>
        ) => (
            /** The node that the transition goes through */
            to: INormalizedNFANode<N, T>,
            /** THe possible transitions */
            transitions: IAugmentedNFATransition<T>[],
            /** The index of the transition */
            index: number,
            /** A map of nodes that can be used to make the choice */
            allNodes: Record<string, INormalizedNFANode<N, T>>
        ) => IAugmentedNFATransition<T> | undefined
    ): {fromNode: N; transition: T}[];
};
