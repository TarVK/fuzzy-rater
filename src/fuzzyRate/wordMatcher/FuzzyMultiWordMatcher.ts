import {createFuzzyNFATemplate} from "./createFuzzyNFATemplate";
import {IFuzzyNodeData} from "./_types/IFuzzyNodeData";
import {IFuzzyTransitionData} from "./_types/IFuzzyTransitionData";
import {IFuzzyWordMatch} from "./_types/IFuzzyWordMatch";
import {NFADFA} from "../../DFA/NFADFA/NFADFA";
import {INFADFATrace} from "../../DFA/NFADFA/_types/INFADFATrace";

/**
 * A fuzzy word matcher that can be used to find a word in a number of items.
 * Initial setup time is relatively long, but matching per string happens in linear time.
 */
export class FuzzyMultiWordMatcher {
    protected NFA: NFADFA<IFuzzyNodeData, IFuzzyTransitionData, IFuzzyNodeData>;
    public word: string;
    public maxDistance: number;

    /**
     * Constructs a new fuzzy word rater
     * @param word The word to look for
     * @param maxDistance The maximum error
     */
    public constructor(word: string, maxDistance: number) {
        this.word = word;
        this.maxDistance = maxDistance;
        this.initialize(word, maxDistance);
    }

    /**
     * Initializes the data structures used for rating
     * @param word The word to look for
     * @param maxDistance The maximal allowed distance
     */
    protected initialize(word: string, maxDistance: number): void {
        const nfaTemplate = createFuzzyNFATemplate(word, maxDistance, true);
        this.NFA = new NFADFA(nfaTemplate, {
            // Add the best combined fuzzy meta to ever node
            nodeMeta: nodes =>
                this.getBestMatch(nodes, n => n.metadata)?.metadata || {
                    matched: false,
                    distance: 0,
                },
            // No need to augment the transitions
            transitionMeta: transition => ({}),
        });
    }

    /**
     * Finds the best match in a set of NFA nodes
     * @param matches The nodes to find the best match in
     * @param getNode Retrieves the node data
     * @param includeNonMatch Whether to fallback to the best non-match if no match was found
     * @returns The best match
     */
    protected getBestMatch<M>(
        matches: M[],
        getNode: (data: M) => IFuzzyNodeData,
        includeNoneMatch: boolean = false
    ): M | undefined {
        const best = matches.reduce((best, m) => {
            const node = getNode(m);
            return node.matched && (best == null || node.distance < best.distance)
                ? {item: m, distance: node.distance}
                : best;
        }, undefined as undefined | {item: M; distance: number});
        if (best) return best.item;
        if (!includeNoneMatch) return;

        const bestNonMatch = matches.reduce((best, m) => {
            const node = getNode(m);
            return best == null || node.distance < best.distance
                ? {item: m, distance: node.distance}
                : best;
        }, undefined as undefined | {item: M; distance: number});
        return bestNonMatch?.item;
    }

    /**
     * Retrieves the best match in the given text
     * @param text The text to find the query word in
     * @returns Whether the text matched, and the distance from the query word
     */
    public getMatch(text: string): {endIndex: number; distance: number}[] {
        // Execute the DFA
        const trace = this.NFA.executeDFATraced(text);

        // Extract the matches from the data
        const lastMatched = trace.final.matched;
        const matchData = trace.path.reduceRight(
            (
                {matches, bestConsecutiveMatch},
                {fromNode: {matched, distance}},
                endIndex
            ) => {
                if (!matched) {
                    return {
                        matches: bestConsecutiveMatch
                            ? [bestConsecutiveMatch, ...matches]
                            : matches,
                        bestConsecutiveMatch: null,
                    };
                } else {
                    // When a node matched, reduce it to the best option of a sequence before adding the match
                    return {
                        matches,
                        bestConsecutiveMatch:
                            !bestConsecutiveMatch ||
                            bestConsecutiveMatch.distance > distance
                                ? {endIndex, distance}
                                : bestConsecutiveMatch,
                    };
                }
            },
            {
                matches: [],
                bestConsecutiveMatch: lastMatched
                    ? {endIndex: text.length, distance: trace.final.distance}
                    : (null as null | {endIndex: number; distance: number}),
            }
        );

        // Return the matches
        return matchData.bestConsecutiveMatch
            ? [matchData.bestConsecutiveMatch, ...matchData.matches]
            : matchData.matches;
    }

    /**
     * Retrieves the best NFA trace given a DFA match
     * @param nfaDfaTrace The simplified NFA-DFA trace to obtain the best NFA trace in (text matches with lowest distance)
     * @returns The NFA trace
     */
    protected getBestTrace(
        nfaDfaTrace: INFADFATrace<IFuzzyNodeData, IFuzzyTransitionData, IFuzzyNodeData>
    ):
        | {
              fromNode: IFuzzyNodeData;
              transition: IFuzzyTransitionData;
          }[]
        | undefined {
        const trace = nfaDfaTrace.getPath(dfaTrace => {
            // Obtain the indices of transitions where to choose the best
            const matchIndices = dfaTrace.path
                .reduceRight(
                    ({matches, bestConsecutive}, {fromNode}, index) => {
                        if (fromNode.matched) {
                            return {
                                matches,
                                bestConsecutive:
                                    !bestConsecutive ||
                                    bestConsecutive.distance > fromNode.distance
                                        ? {index: index - 1, distance: fromNode.distance}
                                        : bestConsecutive,
                            };
                        }
                        return {
                            matches: bestConsecutive
                                ? [bestConsecutive, ...matches]
                                : matches,
                            bestConsecutive: null,
                        };
                    },
                    {
                        matches: [] as {index: number; distance: number}[],
                        bestConsecutive: dfaTrace.final.matched
                            ? {
                                  index: dfaTrace.path.length - 1,
                                  distance: dfaTrace.final.distance,
                              }
                            : (null as null | {index: number; distance: number}),
                    }
                )
                .matches.map(({index}) => index);

            // Return a function that chooses the transition from (/to since moving backwards) a node with the lowest distance, if we found that this leads to the best match
            return (to, transitions, index, nodes) => {
                const possibleTrans = transitions.filter(
                    transition => transition.to == to.ID
                );

                // Look for the best transition that came from a match, and choose that if it exists
                const matching =
                    matchIndices.includes(index) &&
                    possibleTrans.reduce(
                        (best, transition) => {
                            const md = nodes[transition.from]?.metadata;
                            if (md.matched && md.distance < best.distance)
                                return {transition, distance: md.distance};
                            return best;
                        },
                        {transition: null, distance: Infinity}
                    ).transition;
                if (matching) return matching;

                return possibleTrans[0];
            };
        });

        return trace;
    }

    /**
     * Retrieves the best match in the given text, and data of how to obtain it
     * @param text The text to find the query word in
     * @returns The distances from the query word, for each match (no distances = no matches), and how the text differed
     */
    public getMatchData(
        text: string
    ): {distances: number[]; alterations: IFuzzyWordMatch[]} {
        const matches = this.NFA.executeTraced(text);
        const best = this.getBestMatch(matches, ({final}) => final, true);
        const trace = best && this.getBestTrace(best);

        // Convert the NFA trace to an alterations array
        if (best && trace) {
            const result = trace.reduce(
                ({alterations, index, distances, prevNode}, {transition, fromNode}) => {
                    // Skip restart transitions, since they have no relevance in either the query or target
                    if (transition.type == "restart")
                        return {
                            alterations,
                            index,
                            distances: [...distances, fromNode.distance],
                            prevNode,
                        };

                    // Obtain the query and target data
                    const target = {
                        index,
                        character: transition.type == "skip" ? "" : text[index],
                    };
                    const query = {
                        index: transition.index,
                        character: transition.character ?? "",
                    };

                    // Add any distances and alterations
                    const matched = fromNode.matched;
                    const newMatch = prevNode?.matched && !matched; // Make sure we don't include different distances of the same match
                    return {
                        alterations: [
                            ...alterations,
                            {target, query, type: transition.type},
                        ],
                        distances:
                            newMatch && prevNode
                                ? [...distances, prevNode.distance]
                                : distances,
                        index: transition.type == "skip" ? index : index + 1,
                        prevNode: fromNode,
                    };
                },
                {
                    alterations: [] as IFuzzyWordMatch[],
                    distances: [],
                    index: 0,
                    prevNode: null as null | IFuzzyNodeData,
                }
            );

            return {
                alterations: result.alterations,
                distances: best.final.matched
                    ? [...result.distances, best.final.distance]
                    : result.distances,
            };
        }

        return {distances: [], alterations: []};
    }
}
