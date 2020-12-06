import {FuzzyRater} from "../FuzzyRater";
import {shuffle} from "./shuffle.helper";

/**
 * Sorts the given texts according to their scores, from low to high
 * @param texts The texts to be sorted
 * @param scores The scores that go with the texts
 * @returns The sorted texts
 */
function sortResults(texts: string[], scores: number[]): string[] {
    const textsWithScore = texts.map((text, i) => ({text, score: scores[i]}));
    textsWithScore.sort(({score: a}, {score: b}) => a - b);
    return textsWithScore.map(({text}) => text);
}

/**
 * scores, from low to high, and returns the indices they originated from
 * @param scores The scores that go with the texts
 * @returns The sorted indices
 */
function getSortIndices(scores: number[]): number[] {
    const scoreWithIndices = scores.map((score, index) => ({score, index}));
    scoreWithIndices.sort(({score: a}, {score: b}) => a - b);
    return scoreWithIndices.map(({index}) => index);
}

describe("FuzzyRater", () => {
    describe("new FuzzyRater", () => {
        it("Should not error", () => {
            new FuzzyRater("something cool");
        });
    });
    describe("getScore", () => {
        it("Should correctly rate simple queries", () => {
            const rater = new FuzzyRater("something cool");

            // This order is based on the default config that the rater uses, and thus something we may need to update whenever subtle details are changed
            const texts = [
                "I like something cool and col stuff you know",
                "I like something cool and stuff you know",
                "I like something col and something stuff you know",
                "I like something and cool stuff you know",
                "I like something col and stuff you know",
                "I like cool stuff and something else you know",
                "I like cool stuff and somethng else you know",
                "I like cool stuff",
                "I like apples and oranges.",
            ];
            const shuffled = shuffle(texts);

            // Max sure the data is properly shuffled
            expect(shuffled).not.toEqual(texts);

            // Check that the rater rates it in the same order we specified it
            const scores = shuffled.map(text => rater.getScore(text));
            expect(sortResults(shuffled, scores)).toEqual(texts);
        });
    });
    describe("getMatchData", () => {
        it("Should retrieve the same score as getScore", () => {
            const text = "I like something col and something stuff you know";
            const rater = new FuzzyRater("something cool");
            expect(rater.getScore(text)).toEqual(rater.getMatchData(text).score);

            const text2 = `with disconsolate eyes. Her husband had been "deranged in his head" for a few years before
            `;
            const rater2 = new FuzzyRater("orange");
            expect(rater2.getScore(text2)).toEqual(rater2.getMatchData(text2).score);

            const text3 =
                "manner of peasants, grave and slow. But before the sun had set the father had submitted to";
            const rater3 = new FuzzyRater("oranne");
            expect(rater3.getScore(text3)).toEqual(rater3.getMatchData(text3).score);
        });
        it("Should return the correct match groups", () => {
            const text = "I like something col and something stuff you know";
            const rater = new FuzzyRater("something cool");

            const groups = rater.getMatchData(text).matchGroups;
            const simplifiedGroups = groups.map(group => ({
                types: group.relations.map(r => r.type),
                text: group.range.text,
            }));
            expect(simplifiedGroups).toEqual([
                {text: "I like ", types: []},
                {text: "something", types: ["match"]},
                {text: " ", types: []},
                {text: "c", types: ["match"]},
                {text: "", types: ["skip"]},
                {text: "ol", types: ["match"]},
                {text: " and ", types: []},
                {text: "something", types: ["match"]},
                {text: " stuff you know", types: []},
            ]);
        });
    });
});
