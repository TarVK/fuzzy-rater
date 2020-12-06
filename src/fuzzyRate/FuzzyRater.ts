import {WordOrderMatcher} from "./orderMatcher/WordOrderMatcher";
import {IWordOrderMatchInput} from "./orderMatcher/_types/IWordOrderMatchInput";
import {FuzzyMultiWordMatcher} from "./wordMatcher/FuzzyMultiWordMatcher";
import {IFuzzyRateConfig} from "./_types/IFuzzyRaterConfig";
import {IFuzzyWordInput} from "./_types/IFuzzyWordsInput";
import {IFuzzyMatch} from "./_types/IFuzzyMatch";
import {IFuzzyWordMatch} from "./wordMatcher/_types/IFuzzyWordMatch";
import {IQueryWord} from "./_types/IQueryWord";
import {addAlterationData} from "./addAlterationData";
import {IMatchGroup} from "./_types/IMatchGroup";

/**
 * The highest level fuzzy rater class, to rate how well text matches an input query
 */
export class FuzzyRater {
    protected config: Required<IFuzzyRateConfig>;
    protected query: Required<IFuzzyWordInput>[];

    protected wordMatchers: {count: number; matcher: FuzzyMultiWordMatcher}[];
    protected orderMatcher: WordOrderMatcher;

    /**
     * Creates a new fuzzy rater
     * @param query The query to be rate with
     * @param config The configuration for how to rate matches
     */
    public constructor(query: string | IFuzzyWordInput[], config?: IFuzzyRateConfig) {
        const normalized = this.initializeInputs(query, config);
        this.config = normalized.config;
        this.query = normalized.query;
        this.wordMatchers = this.initializeWordMatchers();
        this.orderMatcher = this.initializeOrderMatcher();
    }

    /**
     * Initializes the rater's configuration
     * @param query The query input
     * @param config The config input
     * @returns The normalized query and config with defaults
     */
    protected initializeInputs(
        query: string | IFuzzyWordInput[],
        config?: IFuzzyRateConfig
    ): {query: Required<IFuzzyWordInput>[]; config: Required<IFuzzyRateConfig>} {
        const normalizedConfig = {
            fuzziness: {3: 1, 5: 2},
            skipPenalty: 50,
            missingPenalty: 100,
            typoPenalty: 5,
            extraBonus: 5,
            ...config,
        };

        if (typeof query == "string")
            query = query
                .trim()
                .split(" ")
                .map(word => ({word}));
        const fuzziness = Object.entries(normalizedConfig.fuzziness)
            .map(([a, b]) => [Number(a), b])
            .sort(([a], [b]) => a - b);

        const normalizedQuery = query.map(input => ({
            extraBonus: normalizedConfig.extraBonus,
            maxDistance: fuzziness.reduce(
                (cur, item) => (input.word.length > item[0] ? item[1] : cur),
                0
            ),
            skipPenalty: normalizedConfig.skipPenalty,
            ...input,
        }));
        return {query: normalizedQuery, config: normalizedConfig};
    }

    /**
     * Initializes the word matches
     * @returns The word matchers
     */
    protected initializeWordMatchers(): {
        count: number;
        matcher: FuzzyMultiWordMatcher;
    }[] {
        return this.query.reduce((matchers, {word, maxDistance}, i) => {
            const alreadyContains = matchers.find(({matcher}) => matcher.word == word);
            if (alreadyContains)
                matchers.map(({count, matcher}) =>
                    matcher.word == word ? {count: count + 1, matcher} : {count, matcher}
                );
            return [
                ...matchers,
                {count: 1, matcher: new FuzzyMultiWordMatcher(word, maxDistance)},
            ];
        }, [] as {count: number; matcher: FuzzyMultiWordMatcher}[]);
    }

    /**
     * Initializes the word order matcher
     * @returns The word matcher
     */
    protected initializeOrderMatcher(): WordOrderMatcher {
        return new WordOrderMatcher(
            this.query.map(q => ({word: q.word, penalty: q.skipPenalty}))
        );
    }

    /**
     * Merges two match lists
     * @param m1 The first (sorted) match list
     * @param m2 The second (sorted) match list
     * @returns The combined, sorted, match list
     */
    protected mergeMatches<T extends {index: number}>(m1: T[], m2: T[]): T[] {
        const combined = [] as T[];
        let i = 0,
            j = 0;
        while (i < m1.length && j < m2.length) {
            if (m1[i].index < m2[j].index) combined.push(m1[i++]);
            else combined.push(m2[j++]);
        }
        while (i < m1.length) combined.push(m1[i++]);
        while (j < m2.length) combined.push(m2[j++]);

        return combined;
    }

    /**
     * Computes all relevant match data for the given text
     * @param text The text to get match data for
     * @returns
     */
    public getMatch(text: string): IFuzzyMatch {
        const {missingCost, extraBonus, matches} = this.wordMatchers.reduce(
            (
                {missingCost, extraBonus, matches: prevMatches},
                {count: requireWordCount, matcher}
            ) => {
                // Retrieve the matches for this matcher
                const matches = matcher.getMatch(text);
                const word = matcher.word;
                const normalized = matches.map(match => ({
                    ...match,
                    word,
                    index: match.endIndex - word.length + match.distance,
                    cost: match.distance * this.config.typoPenalty,
                }));

                return {
                    missingCost:
                        missingCost +
                        (matches.length == 0 ? this.config.missingPenalty : 0),
                    // Note: It doesn't consider distance or typos in extra matches
                    extraBonus:
                        extraBonus +
                        Math.max(0, matches.length - requireWordCount) *
                            this.config.extraBonus,
                    matches: this.mergeMatches(prevMatches, normalized),
                };
            },
            {
                missingCost: 0,
                extraBonus: 0,
                matches: [] as (IWordOrderMatchInput & {distance: number})[],
            }
        );

        if (matches.length > 0) {
            const orderCost = this.orderMatcher.getMatch(matches);
            const combinedScore = orderCost + missingCost - extraBonus;
            return {
                score: combinedScore,
                orderCost,
                missingCost,
                extraBonus,
            };
        }

        return {
            score: Infinity,
            orderCost: Infinity,
            missingCost: Infinity,
            extraBonus: 0,
        };
    }

    /**
     * Retrieves the score for a given piece of text
     * @param text The text to be rated
     * @returns A score, where large is worse
     */
    public getScore(text: string): number {
        return this.getMatch(text).score;
    }

    /**
     * Retrieves the match data that can be used for highlighting
     * @param text The text to be matched
     * @returns The scores including match data
     */
    public getMatchData(text: string): IFuzzyMatch & {matchGroups: IMatchGroup[]} {
        const {missingCost, extraBonus, matches, alterations} = this.wordMatchers.reduce(
            (
                {missingCost, extraBonus, matches: prevMatches, alterations},
                {count: requireWordCount, matcher}
            ) => {
                // Retrieve the matches for this matcher
                const matchData = matcher.getMatchData(text);
                const word = matcher.word;
                const matches = matchData.alterations.reduce((matches, alteration) => {
                    if (alteration.query.index == 0 && alteration.type != "ignore") {
                        const distance = matchData.distances[matches.length];
                        return [
                            ...matches,
                            {
                                word,
                                index: alteration.target.index,
                                endIndex:
                                    alteration.target.index + word.length - distance,
                                cost: distance * this.config.typoPenalty,
                            },
                        ];
                    }
                    return matches;
                }, [] as IWordOrderMatchInput[]);

                return {
                    missingCost:
                        missingCost +
                        (matchData.distances.length == 0
                            ? this.config.missingPenalty
                            : 0),
                    // Note: It doesn't consider distance or typos in extra matches
                    extraBonus:
                        extraBonus +
                        Math.max(0, matchData.distances.length - requireWordCount) *
                            this.config.extraBonus,
                    matches: this.mergeMatches(prevMatches, matches),
                    alterations: [
                        ...alterations,
                        {word, alterations: matchData.alterations},
                    ],
                };
            },
            {
                missingCost: 0,
                extraBonus: 0,
                alterations: [] as {word: string; alterations: IFuzzyWordMatch[]}[],
                matches: [] as (IWordOrderMatchInput & {distance: number})[],
            }
        );

        if (matches.length > 0) {
            const orderMatchData = this.orderMatcher.getMatchData(matches);
            const orderCost = orderMatchData.distance;

            // Combine all alterations data
            const words = this.query.map(
                ({word: text}, index): IQueryWord => {
                    const match = orderMatchData.matches.find(m => m.wordIndex == index);
                    return {
                        text,
                        index,
                        matchedIndex: match?.match.index ?? -1,
                    };
                }
            );
            const matchGroups = words.reduce((groups, word) => {
                const wordAlterations = alterations.find(({word: w}) => w == word.text);
                if (wordAlterations)
                    return addAlterationData(groups, wordAlterations.alterations, word);
                return groups;
            }, [] as IMatchGroup[]);

            // Return the final result
            const combinedScore = orderCost + missingCost - extraBonus;
            return {
                matchGroups,
                score: combinedScore,
                orderCost,
                missingCost,
                extraBonus,
            };
        }

        return {
            matchGroups: [],
            score: Infinity,
            orderCost: Infinity,
            missingCost: Infinity,
            extraBonus: 0,
        };
    }
}
