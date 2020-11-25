import {INormalizedNFANode} from "../../../NFA/_types/INormalizedNFANode";
import {INormalizedNFATransition} from "../../../NFA/_types/INormalizedNFATransition";
import {INormalizedDFATemplate} from "../INormalizedDFATemplate";

/** A DFA Template that captures NFA data */
export type IDFANFATemplate<N, T> = INormalizedDFATemplate<
    {sources: INormalizedNFANode<N, T>[]},
    {sources: INormalizedNFATransition<T>[]}
>;
