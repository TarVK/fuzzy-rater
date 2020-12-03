import {createFuzzyNFATemplate} from "./createFuzzyNFATemplate";
import {IFuzzyNodeData} from "./_types/IFuzzyNodeData";
import {IFuzzyTransitionData} from "./_types/IFuzzyTransitionData";
import {IFuzzyWordMatch} from "./_types/IFuzzyWordMatch";
import {NFADFA} from "../../DFA/NFADFA/NFADFA";

/**
 * A fuzzy word matcher that can be used to find a word in a number of items.
 * Initial setup time is relatively long, but matching per string happens in linear time.
 */
export class FuzzyWordMatcher {
    protected NFA: NFADFA<IFuzzyNodeData, IFuzzyTransitionData>;
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
        const nfaTemplate = createFuzzyNFATemplate(word, maxDistance);
        this.NFA = new NFADFA(nfaTemplate);
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
    public getMatch(text: string): IFuzzyNodeData {
        // Execute the DFA
        const matches = this.NFA.execute(text);

        // Find the best match
        const best = this.getBestMatch(matches, node => node);

        // Return the result
        if (best) return {matched: true, distance: best.distance};
        return {matched: false, distance: Infinity};
    }

    /**
     * Retrieves the best match in the given text, and data of how to obtain it
     * @param text The text to find the query word in
     * @returns Whether the text matched, and the distance from the query word, and how the text differed
     */
    public getMatchData(text: string): IFuzzyNodeData & {alterations: IFuzzyWordMatch[]} {
        const matches = this.NFA.executeTraced(text);
        const best = this.getBestMatch(matches, ({final}) => final);
        const trace = best?.getPath();

        // Convert the NFA trace to an alterations array
        if (best && trace) {
            const alterations = trace.reduce(
                ({alterations, index}, {transition}) => {
                    const target = {
                        index,
                        character: transition.type == "skip" ? "" : text[index],
                    };
                    const query = {
                        index: transition.index,
                        character: transition.character ?? "",
                    };
                    return {
                        alterations: [
                            ...alterations,
                            {target, query, type: transition.type},
                        ] as IFuzzyWordMatch[], // Doesn't contain 'restart' transition types
                        index: transition.type == "skip" ? index : index + 1,
                    };
                },
                {alterations: [] as IFuzzyWordMatch[], index: 0}
            )?.alterations;

            return {matched: true, distance: best.final.distance, alterations};
        }

        return {matched: false, distance: Infinity, alterations: []};
    }
}
