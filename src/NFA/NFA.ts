import {INormalizedNFANode} from "./_types/INormalizedNFANode";
import {INormalizedNFATemplate} from "./_types/INormalizedNFATemplate";
import {INormalizedNFATransition} from "./_types/INormalizedNFATransition";
import {INFATrace} from "./_types/INFATrace";

export const remainingCode = "re";
export const emptyCode = "et";

/**
 * A class to represent non-deterministic finite automata and their operations
 */
export class NFA<N, T> {
    // The NFA structure itself
    protected nodes: INormalizedNFANode<N, T>[];
    protected transitions: Record<string, number[]>[];
    protected traceTransitions: Record<string, {state: number; metadata: T}[]>[];
    protected initial: number[];

    /**
     * Creates a new nfa according to the given specification
     * @param template The nfa template
     */
    public constructor(template: INormalizedNFATemplate<N, T>) {
        this.initialize(template);
    }

    /**
     * Retrieves the character code of a given transition
     * @param transition The transition to get a code for the transition character for
     * @returns The character code
     */
    protected getCharacterCode(transition: INormalizedNFATransition<T>): string {
        return transition.type == "character" && transition.character
            ? transition.character
            : transition.type == "empty"
            ? emptyCode
            : remainingCode;
    }

    /**
     * Initializes the NFA structure
     * @param template The NFA template
     */
    protected initialize(template: INormalizedNFATemplate<N, T>): void {
        // Map each node to an index, since node IDs can be very long and therefore inefficient
        const nodeMap = new Map(template.map((node, i) => [node.ID, i]));

        this.nodes = template;
        this.transitions = template.map((node, i) =>
            Object.fromEntries(
                node.transitions.reduce((cur, trans) => {
                    const char = this.getCharacterCode(trans);
                    const group = cur.find(([i]) => i == char);
                    const node = nodeMap.get(trans.to) as number;
                    if (group) {
                        group[1].push(node);
                        return cur;
                    } else {
                        return [...cur, [char, [node]]];
                    }
                }, [] as [string, number[]][])
            )
        );

        // Extra data to perform a faster traced search
        this.traceTransitions = template.map((node, i) =>
            Object.fromEntries(
                node.transitions.reduce((cur, trans) => {
                    const char = this.getCharacterCode(trans);
                    const group = cur.find(([i]) => i == char);
                    const node = nodeMap.get(trans.to) as number;
                    if (group) {
                        group[1].push({state: node, metadata: trans.metadata});
                        return cur;
                    } else {
                        return [
                            ...cur,
                            [char, [{state: node, metadata: trans.metadata}]],
                        ];
                    }
                }, [] as [string, {state: number; metadata: T}[]][])
            )
        );

        // Get all the initial states, following empty transitions
        const initial = template
            .filter(node => node.initial)
            .map(node => nodeMap.get(node.ID))
            .filter((node): node is number => node !== undefined);

        if (initial.length == 0) throw Error("Initial state can't be found");
        this.initial = initial;
    }

    /**
     * Executes the NFA on the given input, and returns the metadata of the final node, if any
     * @param input The input to execute the NFA on
     * @returns The metadata of the states teh automaton finished in
     */
    public execute(input: string): N[] {
        let state = this.followEmptyTransitions(this.initial);

        // Step through all characters
        for (let i = 0; i < input.length; i++) {
            const char = input[i];

            const newState: number[] = [];
            state.forEach(s => {
                const transitions = this.transitions[s];
                const charTrans = transitions[char];

                let trans;
                if (charTrans) trans = charTrans;
                else trans = transitions[remainingCode] || [];
                trans.forEach(t => {
                    if (!newState.includes(t)) newState.push(t);
                });
            });

            state = this.followEmptyTransitions(newState);
        }

        // Return the result
        return state.map(s => this.nodes[s].metadata);
    }

    /**
     * Follows empty transitions from a node, and adds
     * @param nodes The indices of the nodes for which to follow the empty transitions
     * @returns The indices of all nodes reachable in 0 steps
     */
    protected followEmptyTransitions(nodes: number[]): number[] {
        const reachable = [...nodes];
        for (let i = 0; i < reachable.length; i++) {
            const node = reachable[i];
            (this.transitions[node][emptyCode] ?? []).forEach(nextNode => {
                if (!reachable.includes(nextNode)) reachable.push(nextNode);
            });
        }
        return reachable;
    }

    /**
     * Executes the NFA on the given input, and returns the metadata of the trace.
     * If multiple paths to the same final state exist, only a single path is returned
     * @param input The input to execute the NFA on
     * @returns The metadata of the states teh automaton finished in
     */
    public executeTraced(input: string): INFATrace<N, T>[] {
        let state: {
            node: number;
            path: {node: number; transition: T}[];
        }[] = this.initial.map(node => ({node, path: []}));

        // Step through all characters
        for (let i = 0; i < input.length; i++) {
            const char = input[i];

            const newState: {node: number; path: {node: number; transition: T}[]}[] = [];
            state.forEach(({node, path}) => {
                const transitions = this.traceTransitions[node];
                const charTrans = transitions[char];

                let trans;
                if (charTrans) trans = charTrans;
                else trans = transitions[remainingCode] || [];
                trans.forEach(({state, metadata}) => {
                    if (!newState.find(({node}) => node == state))
                        newState.push({
                            node: state,
                            path: [...path, {node, transition: metadata}],
                        });
                });
            });

            state = this.followEmptyTransitionsTraced(newState);
        }

        // Return the result
        return state.map(({node, path}) => ({
            final: this.nodes[node].metadata,
            path: path.map(({node, transition}) => ({
                fromNode: this.nodes[node].metadata,
                transition,
            })),
        }));
    }

    /**
     * Follows empty transitions from a node, and adds
     * @param nodes The indices of the nodes for which to follow the empty transitions
     * @returns The indices of all nodes reachable in 0 steps
     */
    protected followEmptyTransitionsTraced(
        nodes: {node: number; path: {node: number; transition: T}[]}[]
    ): {node: number; path: {node: number; transition: T}[]}[] {
        const reachable = [...nodes];
        for (let i = 0; i < reachable.length; i++) {
            const {node, path} = reachable[i];
            (this.traceTransitions[node][emptyCode] ?? []).forEach(
                ({state, metadata}) => {
                    if (!reachable.find(({node}) => node == state))
                        reachable.push({
                            node: state,
                            path: [...path, {node, transition: metadata}],
                        });
                }
            );
        }
        return reachable;
    }
}
