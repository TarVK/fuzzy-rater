import {INormalizedNFANode} from "../NFA/_types/INormalizedNFANode";
import {INormalizedNFATemplate} from "../NFA/_types/INormalizedNFATemplate";
import {INormalizedNFATransition} from "../NFA/_types/INormalizedNFATransition";
import {convertNFATemplateToDFATemplate} from "./convertNFATemplateToDFATemplate";
import {INormalizedDFANode} from "./_types/INormalizedDFANode";
import {INormalizedDFATemplate} from "./_types/INormalizedDFATemplate";

export const remainingCode = "re";
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
                    trans.type == "character" && trans.character
                        ? trans.character
                        : remainingCode,
                    nodeMap.get(trans.to) as number,
                ])
            )
        );

        // Extra data to perform a faster traced search
        this.traceTransitions = template.nodes.map((node, i) =>
            Object.fromEntries(
                node.transitions.map(trans => [
                    trans.type == "character" && trans.character
                        ? trans.character
                        : remainingCode,
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
     * Executes the DFA on the given input, and keeps track of intermediate steps
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

    /**
     * Creates a DFA equivalent to a given NFA template
     * @param template The NFA template to create an DFA automata from
     * @returns The DFA instance
     */
    public static fromNFATemplate<N, T>(
        template: INormalizedNFATemplate<N, T>
    ): DFA<
        {sources: INormalizedNFANode<N, T>[]},
        {sources: INormalizedNFATransition<T>[]}
    > {
        return new DFA(convertNFATemplateToDFATemplate(template));
    }
}
