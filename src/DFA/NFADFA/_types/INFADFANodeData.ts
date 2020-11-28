import {INormalizedNFANode} from "../../../NFA/_types/INormalizedNFANode";

/** The metadata for DFA-NFA conversion nodes */
export type INFADFANodeData<N, T> = {sources: INormalizedNFANode<N, T>[]};
