/**
 * A non-deterministic finite automaton transition
 */
export type INormalizedNFATransition<T> = {
    /** The ID of the node to go to */
    to: string;
    /**
     * The trigger type:
     * - Character: Takes the transition if the character matches
     * - Remaining: Takes the transition if none of the other character transitions matched
     * - Empty: Always takes the transition, without consuming input
     */
    type: "character" | "remaining" | "empty";
    /** The character to take this transition on */
    character?: string;
    /** The metadata associated with a transition */
    metadata: T;
};
