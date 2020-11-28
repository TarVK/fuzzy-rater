import {convertNFATemplateToDFATemplate} from "../../DFA/convertNFATemplateToDFATemplate";
import {DFA} from "../../DFA/DFA";
import {createFuzzyNFATemplate} from "../createFuzzyNFATemplate";
import {IFuzzyTransitionData} from "../_types/IFuzzyTransitionData";
import {FuzzyWordMatcher} from "../FuzzyWordMatcher";

describe("FuzzyRate", () => {
    describe("createFuzzyNFATemplate", () => {
        const s = Date.now();
        const matcher = new FuzzyWordMatcher("something", 2);
        const e = Date.now() - s;

        const match = matcher.getMatchData("I like somehig yes, ya somehig is good");
        debugger;
    });
});
