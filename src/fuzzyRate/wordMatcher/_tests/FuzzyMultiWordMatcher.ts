import {FuzzyMultiWordMatcher} from "../FuzzyMultiWordMatcher";

/**
 * Retrieves the distances for all matches for each of the inputs under the given matcher
 * @param matcher The matcher to use
 * @param inputs The inputs to match
 * @returns The distances for all matches
 */
function getDistances(matcher: FuzzyMultiWordMatcher, inputs: string[]): number[][] {
    return inputs.map(text => {
        const match = matcher.getMatch(text);
        return match.map(d => d.distance);
    });
}

/**
 * Maps a constant value over an input array
 * @param list The list of inputs to map the constants over
 * @param value The value to map to
 * @returns The list of values
 */
function map<T>(list: any[], value: T): T[] {
    return list.map(() => value);
}

/**
 * Converts a string of alteration codes into the proper alteration types array
 * @param alterations The alterations string
 * @returns The alterations array
 */
function createAlterations(alterations: string): string[] {
    const t = {
        i: "ignore",
        m: "match",
        r: "replace",
        a: "insert",
        s: "skip",
    };
    return Array.from(alterations).map(s => t[s as keyof typeof t] ?? "");
}

describe("FuzzyMultiWordMatcher", () => {
    describe("new FuzzyMultiWordMatcher", () => {
        it("Doesn't error", () => {
            new FuzzyMultiWordMatcher("oranges", 2);
        });
    });
    describe("FuzzyMultiWordMatcher.getMatch", () => {
        it("Should find whether text contains exact matches", () => {
            const matcher = new FuzzyMultiWordMatcher("oranges", 2);
            const match = matcher.getMatch("I like oranges and all oranges");
            const noMatch = matcher.getMatch("Potatoes are amazing");
            expect(match).toEqual([
                {distance: 0, endIndex: 14},
                {endIndex: 30, distance: 0},
            ]);
            expect(noMatch).toEqual([]);
        });
        it("Should find matches at most n characters away", () => {
            const matcher0 = new FuzzyMultiWordMatcher("oranges", 0);
            const matcher1 = new FuzzyMultiWordMatcher("oranges", 1);
            const matcher2 = new FuzzyMultiWordMatcher("oranges", 2);
            const matcher3 = new FuzzyMultiWordMatcher("oranges", 3);
            const matches = ["I like oranges", "oranges are nice"];
            const with1mistake = [
                "I like orange",
                "I like ornges",
                "orangles are nice",
                "oronges are cool",
            ];
            const with2mistakes = [
                "I like ornge",
                "I like orngaes",
                "orlangles are nice",
                "orongkes are cool",
            ];
            const with3mistakes = [
                "I like orne",
                "I like orngaees",
                "orflangles are nice",
                "orlongkes are cool",
            ];
            const noMatches = [
                "I like potaters",
                "hockey is cool sport",
                "That will be 4 bux baby",
            ];
            expect(getDistances(matcher0, matches)).toEqual(map(matches, [0]));
            expect(getDistances(matcher0, with1mistake)).toEqual(map(with1mistake, []));
            expect(getDistances(matcher0, with2mistakes)).toEqual(map(with2mistakes, []));
            expect(getDistances(matcher0, with3mistakes)).toEqual(map(with3mistakes, []));
            expect(getDistances(matcher0, noMatches)).toEqual(map(noMatches, []));
            expect(getDistances(matcher1, matches)).toEqual(map(matches, [0]));
            expect(getDistances(matcher1, with1mistake)).toEqual(map(with1mistake, [1]));
            expect(getDistances(matcher1, with2mistakes)).toEqual(map(with2mistakes, []));
            expect(getDistances(matcher1, with3mistakes)).toEqual(map(with3mistakes, []));
            expect(getDistances(matcher1, noMatches)).toEqual(map(noMatches, []));
            expect(getDistances(matcher2, matches)).toEqual(map(matches, [0]));
            expect(getDistances(matcher2, with1mistake)).toEqual(map(with1mistake, [1]));
            expect(getDistances(matcher2, with2mistakes)).toEqual(
                map(with2mistakes, [2])
            );
            expect(getDistances(matcher2, with3mistakes)).toEqual(map(with3mistakes, []));
            expect(getDistances(matcher2, noMatches)).toEqual(map(noMatches, []));
            expect(getDistances(matcher3, matches)).toEqual(map(matches, [0]));
            expect(getDistances(matcher3, with1mistake)).toEqual(map(with1mistake, [1]));
            expect(getDistances(matcher3, with2mistakes)).toEqual(
                map(with2mistakes, [2])
            );
            expect(getDistances(matcher3, with3mistakes)).toEqual(
                map(with3mistakes, [3])
            );
            expect(getDistances(matcher3, noMatches)).toEqual(map(noMatches, []));
        });
        it("Should find all the matches", () => {
            const matcher = new FuzzyMultiWordMatcher("oranges", 2);
            const match = matcher.getMatch("I like orangs with oranges and some orans");
            expect(match).toEqual([
                {endIndex: 13, distance: 1},
                {endIndex: 26, distance: 0},
                {endIndex: 41, distance: 2},
            ]);
        });
        it("Should obtain the right distances", () => {
            const matcher = new FuzzyMultiWordMatcher("stragled", 2);
            const match = matcher.getMatch(
                "where they sprawled amongst the tough stalks"
            );
            const match2 = matcher.getMatch(
                "wedding guests straggled in pairs and groups"
            );
            expect(match.map(({distance}) => distance)).toEqual([2]);
            expect(match2.map(({distance}) => distance)).toEqual([1]);
        });
    });
    describe("FuzzyMultiWordMatcher.getMatchData", () => {
        it("Should retrieve the change data", () => {
            const matcher = new FuzzyMultiWordMatcher("potatlers", 2);
            const match = matcher.getMatchData(
                "I like potatoes in germany are freaking potaltles you know?"
            );
            expect(match.alterations.map(({type}) => type)).toEqual(
                createAlterations(
                    "iiiiiiimmmmmrmsmiiiiiiiiiiiiiiiiiiiiiiiiimmmmammmsmiiiiiiiiii"
                )
            );
            expect(match.distances).toEqual([2, 2]);

            const match2 = matcher.getMatchData(
                "I like potatoes with poetatlers and potatlers"
            );
            expect(match2.alterations.map(({type}) => type)).toEqual(
                createAlterations("iiiiiiimmmmmrmsmiiiiiimmammmmmmmiiiiimmmmmmmmm")
            );
            expect(match2.distances).toEqual([2, 1, 0]);

            const matcher2 = new FuzzyMultiWordMatcher("oranne", 2);
            const match3 = matcher2.getMatchData("manner");
            expect(match3.alterations.map(({type}) => type)).toEqual(
                createAlterations("srmmmmi")
            );
        });
        it("Shouldn't match unfinished words", () => {
            const matcher = new FuzzyMultiWordMatcher("something", 2);
            const match = matcher.getMatchData("I like to do so");
            expect(match.alterations.map(({type}) => type)).toEqual(
                createAlterations("iiiiiiiiiiiiiii")
            );
        });
    });
});
