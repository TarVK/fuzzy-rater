import {WordOrderMatcher} from "../WordOrderMatcher";
import {IWordOrderMatchInput} from "../_types/IWordOrderMatchInput";
import {IWordOrderMatch} from "../_types/IWordOrderMatch";

/**
 * Retrieves the indices of matches
 * @param matches The found match data
 * @returns The indices of the matches in the original input array
 */
function getMatchIndices(matches: IWordOrderMatch[]): number[] {
    return matches.map(({matchIndex}) => matchIndex);
}

/**
 * Adds the end indices to all of the given inputs
 * @param inputs The list of inputs
 * @returns The inputs with the addition of the end index
 */
function addEnds(inputs: {word: string; index: number}[]): IWordOrderMatchInput[] {
    return inputs.map(n => ({...n, endIndex: n.index + n.word.length}));
}

describe("WordOrderMatcher", () => {
    // Only testing getMatchData, since that uses the same code as findMatch
    describe("getMatchData", () => {
        const m1 = addEnds([
            {
                word: "something",
                index: 0,
            },
            {
                word: "else",
                index: 20,
            },
            {
                word: "cool",
                index: 26,
            },
            {
                word: "something",
                index: 34,
            },
            {
                word: "else",
                index: 43,
            },
            {
                word: "cool",
                index: 55,
            },
            {
                word: "else",
                index: 63,
            },
            {
                word: "cool",
                index: 68,
            },
        ]);
        it("Should choose the best match", () => {
            const matcher = new WordOrderMatcher(["something", "else", "cool"]);
            const match = matcher.getMatchData(m1);
            expect(getMatchIndices(match.matches)).toEqual([3, 4, 5]);
        });
        it("Should choose the best matches based on the specified missing word penalty", () => {
            const matcher = new WordOrderMatcher(["something", "else", "cool"], 10);
            const match = matcher.getMatchData(m1);
            expect(getMatchIndices(match.matches)).toEqual([3, 4, 5]);

            const matcher2 = new WordOrderMatcher(["something", "else", "cool"], 4);
            const match2 = matcher2.getMatchData(m1);
            expect(getMatchIndices(match2.matches)).toEqual([6, 7]);
        });

        const m2 = addEnds([
            {
                word: "else",
                index: 0,
            },
            {word: "something", index: 9},
            {
                word: "cool",
                index: 18,
            },
        ]);
        it("Should be able to skip words when not present of out of order", () => {
            const matcher = new WordOrderMatcher(["something", "else", "cool"], 15);
            const match = matcher.getMatchData(m2);
            expect(getMatchIndices(match.matches)).toEqual([1, 2]);
        });
        it("Should be able to make a word more important by specifying penalties", () => {
            const matcher = new WordOrderMatcher([
                {word: "something", penalty: 15},
                {word: "else", penalty: 20},
                {word: "cool", penalty: 15},
            ]);
            const match = matcher.getMatchData(m2);
            expect(getMatchIndices(match.matches)).toEqual([0, 2]);
        });
    });
});
