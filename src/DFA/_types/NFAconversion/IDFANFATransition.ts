import {INormalizedNFATransition} from "../../../NFA/_types/INormalizedNFATransition";
import {INormalizedDFATransition} from "../INormalizedDFATransition";

/** A DFA Transition that captures NFA data */
export type IDFANFATransition<T> = INormalizedDFATransition<{
    sources: INormalizedNFATransition<T>[];
}>;
