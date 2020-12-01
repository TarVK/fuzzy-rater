import {IWordOrderMatchInput} from "./_types/IWordOrderMatchInput";
import {IWordOrderQueryWordInput} from "./_types/IWordOrderQueryWordInput";
import {IWordOrderMatch} from "./_types/IWordOrderMatch";
import {IWordOrderNode} from "./_types/IWordOrderNode";

/**
 * A class that can judge how well the matches match the order and spacing of the input query.
 * Uses an approach similar to the dynamic programming approach for computing levenshtein distance.
 */
export class WordOrderMatcher {
    protected words: IWordOrderQueryWordInput[];
    protected table: IWordOrderNode[][];

    /**
     * Creates a new word matcher
     * @param words The sequence of words to match, and how important each of them is
     */
    public constructor(words: IWordOrderQueryWordInput[]);
    /**
     * Creates a new word matcher
     * @param words The sequence of words to match
     * @param penalty How bad missing 1 word from the match is, in comparison to words being `penalty` characters apart
     * - penalty = Infinity: always prefer having all words present in sequence, no matter how far apart
     * - penalty = 0: always prefer having consecutive words, no matter if words are missing
     */
    public constructor(words: string[], penalty?: number);
    public constructor(
        words: (string | IWordOrderQueryWordInput)[],
        penalty: number = 10
    ) {
        this.words = words.map(word =>
            typeof word == "string" ? {word, penalty} : word
        );
        this.table = [[]];
        for (let j = 0; j <= words.length; j++) {
            this.table[0][j] = {
                distance:
                    (this.table[0][j - 1]?.distance ?? 0) +
                    (this.words[j - 1]?.penalty ?? 0),
                skippedWord: j > 0,
                lastIndex: 0,
            };
        }
    }

    /**
     * Rates how well the given sequence of words matches the input sequence
     * @param matches The sequence of word matches
     * @returns How well the given input order matches
     */
    public getMatch(matches: IWordOrderMatchInput[]): number {
        return this.findMatch(matches).distance;
    }

    /**
     * Rates how well the given sequence of words matches the input sequence
     * @param matches The sequence of word matches
     * @returns How well the given input order matches, and what the last considered word was
     */
    protected findMatch(
        matches: IWordOrderMatchInput[]
    ): {lastMatchIndex: number; distance: number} {
        const words = this.words;
        const table = this.table;

        // Initialize the first column of values
        for (let i = 1; i <= matches.length; i++)
            table[i] = [{distance: 0, skippedWord: false, lastIndex: 0}];

        // Compute the distances
        for (let i = 1; i <= matches.length; i++) {
            const match = matches[i - 1];
            const {word: matchWord} = match;
            for (let j = 1; j <= words.length; j++) {
                const {word, penalty: missingWordRatio} = words[j - 1];
                if (word == matchWord) {
                    // Consider either the best match for all words so far, or skipping all previous words (similar to "Largest Sum Contiguous Subarray" problem)

                    // All words so far
                    const prevMatch = table[i - 1][j - 1];
                    const addedDistance = Math.abs(
                        match.index -
                            prevMatch.lastIndex -
                            // Subtract 1, since we expect spaces to be present (this slightly penalizes no spaces being present)
                            1
                    );
                    const extendedMatch = {
                        distance: prevMatch.distance + addedDistance,
                        skippedWord: false,
                        lastIndex: match.endIndex,
                    };

                    // Skipping previous words, since the penalties may be better than the distance from previous words
                    const newMatch = {
                        distance: table[0][j - 1].distance,
                        skippedWord: true,
                        lastIndex: match.endIndex,
                    };

                    // Choose the best option
                    table[i][j] =
                        newMatch.distance <= extendedMatch.distance
                            ? newMatch
                            : extendedMatch;
                } else {
                    // Compute option of either skipping the query word, or the input match
                    const skipWord = table[i][j - 1];
                    const skipWordNew = {
                        distance: missingWordRatio + skipWord.distance,
                        skippedWord: true,
                        lastIndex: skipWord.lastIndex,
                    };
                    const skipMatch = table[i - 1][j];
                    const skipMatchNew = {
                        distance: skipMatch.distance,
                        skippedWord: false,
                        lastIndex: skipMatch.lastIndex,
                    };

                    // IF the distance is equally expensive, choose for the furthest match, since it will make for cheaper extended matches
                    if (skipMatchNew.distance == skipWordNew.distance)
                        table[i][j] =
                            skipMatchNew.lastIndex >= skipWordNew.lastIndex
                                ? skipMatchNew
                                : skipWordNew;
                    // If one is cheaper than the other, choose the cheapest
                    else
                        table[i][j] =
                            skipMatchNew.distance <= skipWordNew.distance
                                ? skipMatchNew
                                : skipWordNew;
                }
            }
        }

        // Find the best result
        let bestMatch = table[0][words.length];
        let bestIndex = 0;
        for (let i = 1; i <= matches.length; i++) {
            if (table[i][words.length].distance < bestMatch.distance) {
                bestMatch = table[i][words.length];
                bestIndex = i;
            }
        }

        return {lastMatchIndex: bestIndex, distance: bestMatch.distance};
    }

    /**
     * Rates how well the given sequence of words matches the input sequence, and returns which were matched
     * @param matches The sequence of word matches
     * @returns How well the given input order matches, and the used matches
     */
    public getMatchData(
        matches: IWordOrderMatchInput[]
    ): {distance: number; matches: IWordOrderMatch[]} {
        const words = this.words;
        const table = this.table;

        const match = this.findMatch(matches);

        const res: IWordOrderMatch[] = [];

        // Follow the best trace backwards and add all matches to the result
        let i = match.lastMatchIndex,
            j = words.length;
        while (i > 0 && j > 0) {
            let m = table[i][j];
            if (words[j - 1].word == matches[i - 1].word) {
                res.unshift({
                    match: matches[i - 1],
                    matchIndex: i - 1,
                    wordIndex: j - 1,
                });
                if (m.skippedWord) {
                    break;
                } else {
                    i -= 1;
                    j -= 1;
                }
            } else {
                if (m.skippedWord) {
                    j -= 1;
                } else {
                    i -= 1;
                }
            }
        }

        // return the result
        return {distance: match.distance, matches: res};
    }
}
