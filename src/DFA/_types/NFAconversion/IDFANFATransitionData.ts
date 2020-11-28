import {INormalizedNFATransition} from "../../../NFA/_types/INormalizedNFATransition";

/** The metadata for DFA-NFA conversion transitions */
export type IDFANFATransitionData<T> = {sources: IAugmentedNFATransition<T>[]};

export type IAugmentedNFATransition<T> = {from: string} & INormalizedNFATransition<T>;
