import {INFADFANodeData} from "./INFADFANodeData";
import {INFADFATransitionData} from "./INFADFATransitionData";
import {INormalizedDFATemplate} from "../../_types/INormalizedDFATemplate";

/** A DFA Template that captures NFA data */
export type INFADFATemplate<N, T, CN = unknown, CT = unknown> = INormalizedDFATemplate<
    INFADFANodeData<N, T, CN>,
    INFADFATransitionData<T, CT>
>;
