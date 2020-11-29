import {INFADFANodeData} from "./_types/INFADFANodeData";
import {
    INFADFATransitionData,
    IAugmentedNFATransition,
} from "./_types/INFADFATransitionData";
import {DFA} from "../DFA";
import {INormalizedNFATemplate} from "../../NFA/_types/INormalizedNFATemplate";
import {convertNFATemplateToDFATemplate} from "./convertNFATemplateToDFATemplate";
import {INormalizedNFANode} from "../../NFA/_types/INormalizedNFANode";
import {INFADFATrace} from "./_types/INFADFATrace";
import {INFADFAMetaGetters} from "./_types/INFADFAMetaGetters";

/**
 * A deterministic finite automata that emulates a non-deterministic finite automata.
 * Note that depending on the input NFA, the setup time and automata size may be exponential.
 * Execution time is always linear
 */
export class NFADFA<N, T, CN = unknown, CT = unknown> {
    public DFA: DFA<INFADFANodeData<N, T, CN>, INFADFATransitionData<T, CT>>;
    protected nodes: Record<string, INormalizedNFANode<N, T>>;

    /**
     * Creates a DFA equivalent to a given NFA template
     * @param template The NFA template to create an DFA automata from
     * @param getMeta Functions to add extra meta to the DFA nodes and transitions
     */
    public constructor(
        template: INormalizedNFATemplate<N, T>,
        getMeta?: INFADFAMetaGetters<N, T, CN, CT>
    ) {
        this.initialize(template, getMeta);
    }

    /**
     * Initializes the NFA structure
     * @param template The NFA template
     * @param getMeta Functions to add extra meta to the DFA nodes and transitions
     */
    protected initialize(
        template: INormalizedNFATemplate<N, T>,
        getMeta?: INFADFAMetaGetters<N, T, CN, CT>
    ): void {
        const dfaTemplate = convertNFATemplateToDFATemplate(
            template,
            getMeta as INFADFAMetaGetters<N, T, CN, CT>
        );
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
        if (result) return result.sources.map(s => s.metadata);
        return [];
    }

    /**
     * Executes the NFA on the given input, and returns the metadata of the DFA trace.
     * @param input The input to execute the NFA on
     * @returns The metadata of the states teh automaton finished in
     */
    public executeDFATraced(
        input: string
    ): {
        finished: boolean;
        final: INFADFANodeData<N, T, CN>;
        path: {
            fromNode: INFADFANodeData<N, T, CN>;
            transition: INFADFATransitionData<T, CT>;
        }[];
    } {
        return this.DFA.executeTraced(input);
    }

    /**
     * Executes the NFA on the given input, and returns the metadata of the trace.
     * If multiple paths to the same final state exist, only a single path is returned
     * @param input The input to execute the NFA on
     * @returns The metadata of the states teh automaton finished in
     */
    public executeTraced(input: string): INFADFATrace<N, T, CN, CT>[] {
        const result = this.DFA.executeTraced(input);

        return result.final.sources.map(s => ({
            final: s.metadata,
            getPath: (
                getTransitionChooser = () => (to, transitions) =>
                    transitions.find(transition => transition.to == to.ID)
            ) => {
                const chooseTransition = getTransitionChooser(result);

                // If a best match was found
                const trace = result.path.reduceRight(
                    ({last, trace}, item, i) => {
                        if (!last) return {};

                        // Get all transitions that lead to the correct next node
                        const sourceTransition = chooseTransition(
                            last,
                            item.transition.sources,
                            i,
                            this.nodes
                        );

                        // Follow any empty transitions until a character transition was used
                        const transitionData: {fromNode: N; transition: T}[] = [];
                        let initTransition = sourceTransition;
                        while (initTransition?.type == "empty") {
                            transitionData.unshift({
                                fromNode: this.nodes[initTransition.from].metadata,
                                transition: initTransition.metadata,
                            });
                            initTransition = item.transition.sources.find(
                                transition => transition.to == initTransition?.from
                            );
                        }

                        // Obtain a combination of previous node and transition leading to the next node
                        const source = item.fromNode.sources.find(
                            s => s.ID == initTransition?.from,
                            null
                        );
                        if (source && initTransition)
                            transitionData.unshift({
                                fromNode: source.metadata,
                                transition: initTransition.metadata,
                            });

                        // Store the proper data of the transition, and store the previous node
                        if (!source) return {};
                        return {
                            trace: [...transitionData, ...trace],
                            last: source,
                        };
                    },
                    {trace: [] as {fromNode: N; transition: T}[], last: s}
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
