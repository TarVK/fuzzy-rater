import {DFA} from "../DFA/DFA";
import {IDFANFANodeData} from "../DFA/_types/NFAconversion/IDFANFANodeData";
import {IDFANFATransitionData} from "../DFA/_types/NFAconversion/IDFANFATransitionData";
import {INormalizedNFANode} from "../NFA/_types/INormalizedNFANode";
import {createFuzzyNFATemplate} from "./createFuzzyNFATemplate";
import {IFuzzyNodeData} from "./_types/IFuzzyNodeData";
import {IFuzzyTransitionData} from "./_types/IFuzzyTransitionData";
import {IFuzzyWordMatch} from "./_types/IFuzzyWordMatch";

export class FuzzyWordMatcher {
    protected DFA: DFA<
        IDFANFANodeData<IFuzzyNodeData, IFuzzyTransitionData>,
        IDFANFATransitionData<IFuzzyTransitionData>
    >;

    /**
     * Constructs a new fuzzy word rater
     * @param word The word to look for
     * @param maxDistance The maximum error
     */
    public constructor(word: string, maxDistance: number) {
        this.initialize(word, maxDistance);
    }

    /**
     * Initializes the data structures used for rating
     * @param word The word to look for
     * @param maxDistance The maximal allowed distance
     */
    protected initialize(word: string, maxDistance: number): void {
        const nfaTemplate = createFuzzyNFATemplate(word, maxDistance);
        this.DFA = DFA.fromNFATemplate(nfaTemplate);
    }

    /**
     * Finds the best match in a set of NFA nodes
     * @param nodes The nodes to find the best match in
     * @returns The best match
     */
    protected getBestMatch(
        nodes: INormalizedNFANode<IFuzzyNodeData, IFuzzyTransitionData>[]
    ): INormalizedNFANode<IFuzzyNodeData, IFuzzyTransitionData> | undefined {
        return nodes.reduce(
            (best, item) => {
                const md = item.metadata;
                return md.distance < best.distance && md.matched
                    ? {item, distance: md.distance}
                    : best;
            },
            {item: undefined, distance: Infinity}
        ).item;
    }

    /**
     * Retrieves the best match in the given text
     * @param text The text to find the query word in
     * @returns Whether the text matched, and the distance from the query word
     */
    public getMatch(text: string): {matched: boolean; distance: number} {
        // Execute the DFA
        const match = this.DFA.execute(text);

        // Find the best match
        const best = match?.sources && this.getBestMatch(match?.sources);

        // Return the result
        if (best) return {matched: true, distance: best.metadata.distance};
        return {matched: false, distance: Infinity};
    }

    /**
     * Retrieves the best match in the given text, and data of how to obtain it
     * @param text The text to find the query word in
     * @returns Whether the text matched, and the distance from the query word, and how the text differed
     */
    public getMatchData(
        text: string
    ): {matched: boolean; distance: number; alterations: IFuzzyWordMatch[]} {
        const match = this.DFA.executeTraced(text);

        if (match.finished) {
            // Find the best match
            const best = match?.final.sources && this.getBestMatch(match?.final.sources);

            if (best) {
                // If a best match was found
                const changes = match.path.reduceRight(
                    ({last, changes}, item, i) => {
                        if (!last) return {};

                        // Get all transitions that lead to the correct next node
                        const sourceTransition = item.transition.sources.find(
                            transition => transition.to == last.ID
                        );

                        // Follow any empty transitions until a character transition was used
                        let initTransition = sourceTransition;
                        const transitions = [];
                        while (initTransition?.type == "empty") {
                            transitions.unshift(initTransition);
                            initTransition = item.transition.sources.find(
                                transition => transition.to == initTransition?.from
                            );
                        }
                        if (initTransition) transitions.unshift(initTransition);

                        // Obtain a combination of previous node and transition leading to the next node
                        const source = item.node.sources.find(
                            s => s.ID == initTransition?.from,
                            null
                        );

                        // Store the proper data of the transition, and store the previous node
                        if (!source) return {};
                        return {
                            changes: [
                                ...transitions.map(({metadata}, ti) => ({
                                    type: metadata.type,
                                    query: {
                                        index: metadata.index,
                                        character: metadata.character ?? "",
                                    },
                                    target: {
                                        index: i,
                                        character: ti == 0 ? text[i] : "",
                                    },
                                })),
                                ...changes,
                            ],
                            last: source,
                        };
                    },
                    {changes: [] as IFuzzyWordMatch[], last: best}
                )?.changes;
                // TODO: test what the changes data is like when having 2 consequetive skips

                if (changes) {
                    // Map the transition metadata to the correct format
                    return {
                        matched: true,
                        distance: best.metadata.distance,
                        alterations: changes,
                    };
                } else {
                    // I don't think this can occur, but I'm not positive, so this is a safe-ish failure case
                    console.error("Didn't manage to find a path", text, match);
                    return {
                        matched: true,
                        distance: best.metadata.distance,
                        alterations: [],
                    };
                }
            }
        }

        return {matched: false, distance: Infinity, alterations: []};
    }
}
