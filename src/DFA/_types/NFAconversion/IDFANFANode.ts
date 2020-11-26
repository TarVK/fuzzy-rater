import {INormalizedNFANode} from "../../../NFA/_types/INormalizedNFANode";
import {INormalizedNFATransition} from "../../../NFA/_types/INormalizedNFATransition";
import {INormalizedDFANode} from "../INormalizedDFANode";
import {IDFANFANodeData} from "./IDFANFANodeData";
import {IDFANFATransitionData} from "./IDFANFATransitionData";

/** A DFA Node that captures NFA data */
export type IDFANFANode<N, T> = INormalizedDFANode<
    IDFANFANodeData<N, T>,
    IDFANFATransitionData<T>
>;
