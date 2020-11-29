import {INormalizedDFANode} from "../../_types/INormalizedDFANode";
import {INFADFANodeData} from "./INFADFANodeData";
import {INFADFATransitionData} from "./INFADFATransitionData";

/** A DFA Node that captures NFA data */
export type IDFANFANode<N, T, CN = unknown, CT = unknown> = INormalizedDFANode<
    INFADFANodeData<N, T, CN>,
    INFADFATransitionData<T, CT>
>;
