import {INormalizedNFATransition} from "../../../NFA/_types/INormalizedNFATransition";

/** The metadata for DFA-NFA conversion transitions */
export type INFADFATransitionData<T, CT = unknown> = {
    sources: IAugmentedNFATransition<T>[];
} & CT;

export type IAugmentedNFATransition<T> = {from: string} & INormalizedNFATransition<T>;
