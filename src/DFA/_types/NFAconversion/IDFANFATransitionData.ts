import {INormalizedNFATransition} from "../../../NFA/_types/INormalizedNFATransition";

/** The metadata for DFA-NFA conversion transitions */
export type IDFANFATransitionData<T> = {sources: INormalizedNFATransition<T>[]};
