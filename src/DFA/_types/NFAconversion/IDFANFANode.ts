import {INormalizedNFANode} from "../../../NFA/_types/INormalizedNFANode";
import {INormalizedNFATransition} from "../../../NFA/_types/INormalizedNFATransition";
import {INormalizedDFANode} from "../INormalizedDFANode";

/** A DFA Node that captures NFA data */
export type IDFANFANode<N, T> = INormalizedDFANode<
    {sources: INormalizedNFANode<N, T>[]},
    {sources: INormalizedNFATransition<T>[]}
>;
