import {INFADFANodeData} from "./_types/INFADFANodeData";
import {INFADFATransitionData} from "./_types/INFADFATransitionData";
import {DFA} from "../DFA";
import {INormalizedNFATemplate} from "../../NFA/_types/INormalizedNFATemplate";
import {convertNFATemplateToDFATemplate} from "./convertNFATemplateToDFATemplate";
import {INormalizedNFANode} from "../../NFA/_types/INormalizedNFANode";

/**
 * A deterministic finite automata that emulates a non-deterministic finite automata.
 * Note that depending on the input NFA, the setup time and automata size may be exponential.
 * Execution time is always linear
 */
export class NFADFA<N, T> {
    public DFA: DFA<INFADFANodeData<N, T>, INFADFATransitionData<T>>;
    protected nodes: Record<string, INormalizedNFANode<N, T>>;

    /**
     * Creates a DFA equivalent to a given NFA template
     * @param template The NFA template to create an DFA automata from
     */
    public constructor(template: INormalizedNFATemplate<N, T>) {
        this.initialize(template);
    }

    /**
     * Initializes the NFA structure
     * @param template The NFA template
     */
    protected initialize(template: INormalizedNFATemplate<N, T>): void {
        const dfaTemplate = convertNFATemplateToDFATemplate(template);
        this.nodes = Object.fromEntries(template.map(v => [v.ID, v]));
        this.DFA = new DFA(dfaTemplate);
    }

    /**
     * Executes the NFA on the given input, and returns the metadata of the final node, if any
     * @param input The input to execute the NFA on
     * @returns The metadata of the states teh automaton finished in
     */
    public execute(input: string): N[] {
        const result = this.DFA.execute(input);
        if (result) result.sources.map(s => s.metadata);
        return [];
    }

    /**
     * Executes the NFA on the given input, and returns the metadata of the trace.
     * If multiple paths to the same final state exist, only a single path is returned
     * @param input The input to execute the NFA on
     * @returns The metadata of the states teh automaton finished in
     */
    public executeTraced(
        input: string
    ): {final: N; getPath(): {node: N; transition: T}[]}[] {
        const result = this.DFA.executeTraced(input);
        return result.final.sources.map(s => ({
            final: s.metadata,
            getPath: () => {
                // If a best match was found
                const trace = result.path.reduceRight(
                    ({last, trace}, item, i) => {
                        if (!last) return {};

                        // Get all transitions that lead to the correct next node
                        const sourceTransition = item.transition.sources.find(
                            transition => transition.to == last.ID
                        );

                        // Follow any empty transitions until a character transition was used
                        const transitionData: {node: N; transition: T}[] = [];
                        let initTransition = sourceTransition;
                        while (initTransition?.type == "empty") {
                            transitionData.unshift({
                                transition: initTransition.metadata,
                                node: this.nodes[initTransition.from].metadata,
                            });
                            initTransition = item.transition.sources.find(
                                transition => transition.to == initTransition?.from
                            );
                        }

                        // Obtain a combination of previous node and transition leading to the next node
                        const source = item.node.sources.find(
                            s => s.ID == initTransition?.from,
                            null
                        );
                        if (source && initTransition)
                            transitionData.unshift({
                                node: source.metadata,
                                transition: initTransition.metadata,
                            });

                        // Store the proper data of the transition, and store the previous node
                        if (!source) return {};
                        return {
                            trace: [...transitionData, ...trace],
                            last: source,
                        };
                    },
                    {trace: [] as {node: N; transition: T}[], last: s}
                )?.trace;

                if (trace) {
                    // Map the transition metadata to the correct format
                    return trace;
                } else {
                    // I don't think this can occur, but I'm not positive, so this is a safe-ish failure case
                    console.error("Didn't manage to find a path", input, s);
                    return [];
                }
            },
        }));
    }
}
