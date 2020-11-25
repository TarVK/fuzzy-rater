import {INormalizedNFATemplate} from "./_types/INormalizedNFATemplate";

/**
 * A class to represent non-deterministic finite automata and their operations
 */
export class NFA<N, T> {
    /**
     * Creates a new nfa according to the given specification
     * @param template The nfa template
     */
    public constructor(template: INormalizedNFATemplate<N, T>) {}
}
