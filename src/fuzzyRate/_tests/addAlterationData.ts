import {addAlterationData} from "../addAlterationData";
import {FuzzyMultiWordMatcher} from "../wordMatcher/FuzzyMultiWordMatcher";
import {IMatchGroup} from "../_types/IMatchGroup";

/**
 * Simplifies the match groups to check the result
 * @param matchGroups The match groups
 * @returns The simplified match groups
 */
function simplifyMatchGroups(matchGroups: IMatchGroup[]): [string, string[]][] {
    return matchGroups.map(group => [group.range.text, group.relations.map(v => v.type)]);
}

describe("addAlterationData", () => {
    it("Should properly add alteration data of all matches", () => {
        const inputText = "hallo I like potatoes and the likes";
        const q1 = {
            index: 0,
            text: "lie",
            matchedIndex: -1,
        };
        const q2 = {
            index: 1,
            text: "poatloes",
            matchedIndex: -1,
        };
        const q1Matcher = new FuzzyMultiWordMatcher(q1.text, 1);
        const q2Matcher = new FuzzyMultiWordMatcher(q2.text, 2);

        const q1match = q1Matcher.getMatchData(inputText);
        const q2match = q2Matcher.getMatchData(inputText);

        const matchesQ1 = addAlterationData([], q1match.alterations, q1);
        const matchesQ2 = addAlterationData(matchesQ1, q2match.alterations, q2);

        expect(simplifyMatchGroups(matchesQ2)).toEqual([
            ["hallo I ", []],
            ["li", ["match"]],
            ["k", ["insert"]],
            ["e", ["match"]],
            [" ", []],
            ["po", ["match"]],
            ["t", ["insert"]],
            ["at", ["match"]],
            ["", ["skip"]],
            ["oes", ["match"]],
            [" and the ", []],
            ["li", ["match"]],
            ["k", ["insert"]],
            ["e", ["match"]],
            ["s", []],
        ]);
    });
    it("Should properly retain 0 character groups", () => {
        const inputText = "I like blcks yes";
        const q1 = {
            index: 0,
            text: "locks",
            matchedIndex: -1,
        };
        const q2 = {
            index: 1,
            text: "yes",
            matchedIndex: -1,
        };
        const q1Matcher = new FuzzyMultiWordMatcher(q1.text, 1);
        const q2Matcher = new FuzzyMultiWordMatcher(q2.text, 1);

        const q1match = q1Matcher.getMatchData(inputText);
        const q2match = q2Matcher.getMatchData(inputText);

        const matchesQ1 = addAlterationData([], q1match.alterations, q1);
        const matchesQ2 = addAlterationData(matchesQ1, q2match.alterations, q2);

        expect(simplifyMatchGroups(matchesQ2)).toEqual([
            ["I like b", []],
            ["l", ["match"]],
            ["", ["skip"]],
            ["cks", ["match"]],
            [" ", []],
            ["yes", ["match"]],
        ]);
    });
    it("Should properly merge multiple 0 character groups", () => {
        const inputText = "I like blcks yes";
        const q1 = {
            index: 0,
            text: "locks",
            matchedIndex: -1,
        };
        const q2 = {
            index: 1,
            text: "black",
            matchedIndex: -1,
        };
        const q1Matcher = new FuzzyMultiWordMatcher(q1.text, 1);
        const q2Matcher = new FuzzyMultiWordMatcher(q2.text, 1);

        const q1match = q1Matcher.getMatchData(inputText);
        const q2match = q2Matcher.getMatchData(inputText);

        const matchesQ1 = addAlterationData([], q1match.alterations, q1);
        const matchesQ2 = addAlterationData(matchesQ1, q2match.alterations, q2);

        expect(simplifyMatchGroups(matchesQ2)).toEqual([
            ["I like ", []],
            ["b", ["match"]],
            ["l", ["match", "match"]],
            ["", ["skip", "skip"]],
            ["ck", ["match", "match"]],
            ["s", ["match"]],
            [" yes", []],
        ]);
    });
});
