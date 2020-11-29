import {createFuzzyNFATemplate} from "./createFuzzyNFATemplate";
import {IFuzzyNodeData} from "./_types/IFuzzyNodeData";
import {IFuzzyTransitionData} from "./_types/IFuzzyTransitionData";
import {IFuzzyWordMatch} from "./_types/IFuzzyWordMatch";
import {NFADFA} from "../DFA/NFADFA/NFADFA";

/**
 * A fuzzy word matcher that can be used to find a word in a number of items.
 * Initial setup time is relatively long, but matching per string happens in linear time.
 */
export class FuzzyMultiWordMatcher {
    protected NFA: NFADFA<IFuzzyNodeData, IFuzzyTransitionData, IFuzzyNodeData>;

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
     * @returns The best match
     */
    protected getBestMatch<M>(
        matches: M[],
        getNode: (data: M) => IFuzzyNodeData
    ): M | undefined {
        const best = matches.reduce((best, m) => {
            const node = getNode(m);
            return node.matched && (best == null || node.distance < best.distance)
                ? {item: m, distance: node.distance}
                : best;
        }, undefined as undefined | {item: M; distance: number});
        return best?.item;
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
            ({matches, lastMatched}, {node: {matched, distance}}, endIndex) => {
                if (!lastMatched && matched) {
                    return {
                        matches: [{endIndex, distance}, ...matches],
                        lastMatched: matched,
                    };
                } else {
                    return {
                        matches,
                        lastMatched: matched,
                    };
                }
            },
            {
                matches: lastMatched
                    ? [{endIndex: text.length, distance: trace.final.distance}]
                    : [],
                lastMatched,
            }
        );
        // Return the matches
        return matchData.matches;
    }

    /**
     * Retrieves the best match in the given text, and data of how to obtain it
     * @param text The text to find the query word in
     * @returns Whether the text matched, and the distance from the query word, and how the text differed
     */
    public getMatchData(
        text: string
    ): {matched: boolean; distance: number; alterations: IFuzzyWordMatch[]} {
        const matchesDfa = this.NFA.executeDFATraced(text);
        const matches = this.NFA.executeTraced(text);

        const path = matches[0].getPath((to, transitions, nodes) => {
            const possibleTrans = transitions.filter(
                transition => transition.to == to.ID
            );
            const matching = possibleTrans.filter(
                transition => nodes[transition.from]?.metadata.matched
            );
            // if (possibleTrans.length > 1) debugger;
            if (matching.length) return matching[0];
            return possibleTrans[0];
        });

        debugger;
        // const best = this.getBestMatch(matches, ({final}) => final);
        // const trace = best?.getPath();

        // // Convert the NFA trace to an alterations array
        // if (best && trace) {
        //     const alterations = trace.reduce(
        //         ({alterations, index}, {transition}) => {
        //             const target = {
        //                 index,
        //                 character: transition.type == "skip" ? "" : text[index],
        //             };
        //             const query = {
        //                 index: transition.index,
        //                 character: transition.character ?? "",
        //             };
        //             return {
        //                 alterations: [
        //                     ...alterations,
        //                     {target, query, type: transition.type},
        //                 ],
        //                 index: transition.type == "skip" ? index : index + 1,
        //             };
        //         },
        //         {alterations: [] as IFuzzyWordMatch[], index: 0}
        //     )?.alterations;

        //     return {matched: true, distance: best.final.distance, alterations};
        // }

        return {matched: false, distance: Infinity, alterations: []};
    }
}
