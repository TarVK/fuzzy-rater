import {INFADFATransitionData} from "./INFADFATransitionData";
import {INormalizedDFATransition} from "../../_types/INormalizedDFATransition";

/** A DFA Transition that captures NFA data */
export type INFADFATransition<T> = INormalizedDFATransition<INFADFATransitionData<T>>;
