import {FuzzyWordMatcher} from "../FuzzyWordMatcher";

/**
 * Retrieves the distances for each of the inputs under the given matcher, or false if the text didn't match
 * @param matcher The matcher to use
 * @param inputs The inputs to match
 * @returns The distances or false for not matched inputs
 */
function getDistances(matcher: FuzzyWordMatcher, inputs: string[]): (number | false)[] {
    return inputs.map(text => {
        const match = matcher.getMatch(text);
        if (match.matched) return match.distance;
        return false;
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

describe("FuzzyWordMatcher", () => {
    describe("new FuzzyWordMatcher", () => {
        it("Doesn't error", () => {
            new FuzzyWordMatcher("oranges", 2);
        });
    });
    describe("FuzzyWordMatcher.getMatch", () => {
        it("Should find whether text contains exact matches", () => {
            const matcher = new FuzzyWordMatcher("oranges", 2);
            const match = matcher.getMatch("I like oranges");
            const noMatch = matcher.getMatch("Potatoes are amazing");
            expect(match.matched).toBeTruthy();
            expect(noMatch.matched).toBeFalsy();
        });
        it("Should find matches at most n characters away", () => {
            const matcher0 = new FuzzyWordMatcher("oranges", 0);
            const matcher1 = new FuzzyWordMatcher("oranges", 1);
            const matcher2 = new FuzzyWordMatcher("oranges", 2);
            const matcher3 = new FuzzyWordMatcher("oranges", 3);
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
            expect(getDistances(matcher0, matches)).toEqual(map(matches, 0));
            expect(getDistances(matcher0, with1mistake)).toEqual(
                map(with1mistake, false)
            );
            expect(getDistances(matcher0, with2mistakes)).toEqual(
                map(with2mistakes, false)
            );
            expect(getDistances(matcher0, with3mistakes)).toEqual(
                map(with3mistakes, false)
            );
            expect(getDistances(matcher0, noMatches)).toEqual(map(noMatches, false));
            expect(getDistances(matcher1, matches)).toEqual(map(matches, 0));
            expect(getDistances(matcher1, with1mistake)).toEqual(map(with1mistake, 1));
            expect(getDistances(matcher1, with2mistakes)).toEqual(
                map(with2mistakes, false)
            );
            expect(getDistances(matcher1, with3mistakes)).toEqual(
                map(with3mistakes, false)
            );
            expect(getDistances(matcher1, noMatches)).toEqual(map(noMatches, false));
            expect(getDistances(matcher2, matches)).toEqual(map(matches, 0));
            expect(getDistances(matcher2, with1mistake)).toEqual(map(with1mistake, 1));
            expect(getDistances(matcher2, with2mistakes)).toEqual(map(with2mistakes, 2));
            expect(getDistances(matcher2, with3mistakes)).toEqual(
                map(with3mistakes, false)
            );
            expect(getDistances(matcher2, noMatches)).toEqual(map(noMatches, false));
            expect(getDistances(matcher3, matches)).toEqual(map(matches, 0));
            expect(getDistances(matcher3, with1mistake)).toEqual(map(with1mistake, 1));
            expect(getDistances(matcher3, with2mistakes)).toEqual(map(with2mistakes, 2));
            expect(getDistances(matcher3, with3mistakes)).toEqual(map(with3mistakes, 3));
            expect(getDistances(matcher3, noMatches)).toEqual(map(noMatches, false));
        });
        it("Should find the best match", () => {
            const matcher = new FuzzyWordMatcher("oranges", 2);
            const match = matcher.getMatch("I like orangs with oranges and some orans");
            expect(match).toEqual({matched: true, distance: 0});
        });
    });
    describe("FuzzyWordMatcher.getMatchData", () => {
        it("Should retrieve the change data", () => {
            const matcher = new FuzzyWordMatcher("potatlers", 2);
            const match = matcher.getMatchData("I like potatoes in germany");
            expect(match.alterations.map(({type}) => type)).toEqual(
                createAlterations("iiiiiiimmmmmrmsmiiiiiiiiiii")
            );

            const match2 = matcher.getMatchData("I like potaltles in germany");
            expect(match2.alterations.map(({type}) => type)).toEqual(
                createAlterations("iiiiiiimmmmammmsmiiiiiiiiiii")
            );
        });
    });
});
