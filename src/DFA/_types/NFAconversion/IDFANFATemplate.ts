import {INormalizedNFANode} from "../../../NFA/_types/INormalizedNFANode";
import {INormalizedNFATransition} from "../../../NFA/_types/INormalizedNFATransition";
import {INormalizedDFATemplate} from "../INormalizedDFATemplate";
import {IDFANFANodeData} from "./IDFANFANodeData";
import {IDFANFATransitionData} from "./IDFANFATransitionData";

/** A DFA Template that captures NFA data */
export type IDFANFATemplate<N, T> = INormalizedDFATemplate<
    IDFANFANodeData<N, T>,
    IDFANFATransitionData<T>
>;
