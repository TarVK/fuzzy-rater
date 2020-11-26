import {INormalizedNFANode} from "../../../NFA/_types/INormalizedNFANode";

/** The metadata for DFA-NFA conversion nodes */
export type IDFANFANodeData<N, T> = {sources: INormalizedNFANode<N, T>[]};
