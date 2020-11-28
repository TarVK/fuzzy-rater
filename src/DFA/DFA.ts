import {INormalizedNFATemplate} from "../NFA/_types/INormalizedNFATemplate";
import {convertNFATemplateToDFATemplate} from "./NFADFA/convertNFATemplateToDFATemplate";
import {INormalizedDFANode} from "./_types/INormalizedDFANode";
import {INormalizedDFATemplate} from "./_types/INormalizedDFATemplate";
import {INormalizedDFATransition} from "./_types/INormalizedDFATransition";

export const remainingCode = "re";

/**
 * A class to represent deterministic finite automata and their operations
 */
export class DFA<N, T> {
    // The DFA structure itself
    protected nodes: INormalizedDFANode<N, T>[];
    protected traceTransitions: Record<string, {state: number; metadata: T}>[];
    protected transitions: Record<string, number>[];
    protected initial: number;

    /**
     * Creates a new DFA according to the given template
     * @param template The template of the DFA
     */
    public constructor(template: INormalizedDFATemplate<N, T>) {
        this.initialize(template);
    }

    /**
     * Retrieves the character code of a given transition
     * @param transition The transition to get a code for the transition character for
     * @returns The character code
     */
    protected getCharacterCode(transition: INormalizedDFATransition<T>): string {
        return transition.type == "character" && transition.character
            ? transition.character
            : remainingCode;
    }

    /**
     * Initializes the DFA structure
     * @param template The DFA template
     */
    protected initialize(template: INormalizedDFATemplate<N, T>): void {
        // Map each node to an index, since node IDs can be very long and therefore inefficient
        const nodeMap = new Map(template.nodes.map((node, i) => [node.ID, i]));

        const initial = nodeMap.get(template.initial);
        if (initial === undefined) throw Error("Initial state can't be found");
        this.initial = initial;
        this.nodes = template.nodes;

        this.transitions = template.nodes.map((node, i) =>
            Object.fromEntries(
                node.transitions.map(trans => [
                    this.getCharacterCode(trans),
                    nodeMap.get(trans.to) as number,
                ])
            )
        );

        // Extra data to perform a faster traced search
        this.traceTransitions = template.nodes.map((node, i) =>
            Object.fromEntries(
                node.transitions.map(trans => [
                    this.getCharacterCode(trans),
                    {state: nodeMap.get(trans.to) as number, metadata: trans.metadata},
                ])
            )
        );
    }

    /**
     * Executes the DFA on the given input, and returns the metadata of the final node, if any
     * @param input The input to execute the DFA on
     * @returns The metadata
     */
    public execute(input: string): undefined | N {
        let state: number = this.initial;

        // Step through all characters
        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            if (state == undefined) return;

            const transitions = this.transitions[state];
            state = transitions[char] || transitions[remainingCode];
        }

        // Return the result
        if (state == undefined) return;
        const node = this.nodes[state];
        return node?.metadata;
    }

    /**
     * Executes the DFA on the given input, and returns the metadata of the trace
     * @param input The input to execute the DFA on
     * @returns The metadata
     */
    public executeTraced(
        input: string
    ): {finished: boolean; final: N; path: {node: N; transition: T}[]} {
        let state: number = this.initial;
        const path: {node: N; transition: T}[] = [];

        // Step through all characters
        for (let i = 0; i < input.length; i++) {
            const char = input[i];

            const transitions = this.traceTransitions[state];
            const data = transitions[char] || transitions[remainingCode];

            const md = this.nodes[state].metadata;
            if (data) {
                path.push({node: md, transition: data.metadata});
                state = data.state;
            } else return {finished: false, final: md, path};
        }

        // Return the result
        const node = this.nodes[state];
        return {finished: true, final: node.metadata, path};
    }
}
