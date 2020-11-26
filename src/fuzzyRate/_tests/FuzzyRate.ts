import {convertNFATemplateToDFATemplate} from "../../DFA/convertNFATemplateToDFATemplate";
import {DFA} from "../../DFA/DFA";
import {createFuzzyNFATemplate} from "../createFuzzyNFATemplate";
import {IFuzzyTransitionData} from "../_types/IFuzzyTransitionData";

describe("FuzzyRate", () => {
    describe("createFuzzyNFATemplate", () => {
        const s = Date.now();
        const nfaTemplate = createFuzzyNFATemplate("wwater", 2);
        const dfaTemplate = convertNFATemplateToDFATemplate(nfaTemplate);
        const dfa = new DFA(dfaTemplate);
        const e = Date.now() - s;

        const match = dfa.executeTraced("what is wter then?");
        if (match.finished) {
            const best = match.final.sources.reduce(
                (best, item) => {
                    const md = item.metadata;
                    return md.distance < best.distance && md.matched
                        ? {item, distance: md.distance}
                        : best;
                },
                {item: null, distance: Infinity}
            ).item;

            if (best) {
                const res = match.path.reduceRight(
                    ({last, transitions}, item) => {
                        if (!last) return {};
                        const possibleTransitions = item.transition.sources.filter(
                            transition => transition.to == last.ID
                        );
                        const data = item.node.sources.reduce((c, s) => {
                            if (c) return c;
                            const trans = possibleTransitions.find(transition =>
                                s.transitions.includes(transition)
                            );
                            if (trans) return {source: s, transition: trans};
                        }, null);
                        if (!data) return {};
                        return {
                            transitions: [data.transition.metadata, ...transitions],
                            last: data.source,
                        };
                    },
                    {transitions: [] as IFuzzyTransitionData[][], last: best}
                );
                debugger;
            }
        }

        // debugger;
    });
});
