import {INormalizedNFATransition} from "../../../NFA/_types/INormalizedNFATransition";
import {INormalizedDFATransition} from "../INormalizedDFATransition";
import {IDFANFATransitionData} from "./IDFANFATransitionData";

/** A DFA Transition that captures NFA data */
export type IDFANFATransition<T> = INormalizedDFATransition<IDFANFATransitionData<T>>;
