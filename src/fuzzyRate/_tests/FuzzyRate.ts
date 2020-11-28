import {FuzzyWordMatcher} from "../FuzzyWordMatcher";
import {createFuzzyNFATemplate} from "../createFuzzyNFATemplate";
import {NFA} from "../../NFA/NFA";
import {NFADFA} from "../../DFA/NFADFA/NFADFA";

describe("FuzzyRate", () => {
    describe("createFuzzyNFATemplate", () => {
        const s = Date.now();
        const matcher = new FuzzyWordMatcher("something", 2);
        const e = Date.now() - s;

        const match = matcher.getMatchData("I like somehig yes, ya somehig is good");
        debugger;
    });
    describe("createFuzzyNFATemplate", () => {
        const nfaTemplate = createFuzzyNFATemplate("something", 2);
        const nfa = new NFADFA(nfaTemplate);

        const matches = nfa.executeTraced("I like somting yes");
        const match = matches.reduce(
            (best, m) =>
                m.final.matched &&
                (best == null || m.final.distance < best.final.distance)
                    ? m
                    : best,
            null as null | (typeof matches extends (infer T)[] ? T : never)
        );
        const trace = match?.getPath();
        // debugger;
    });
});
