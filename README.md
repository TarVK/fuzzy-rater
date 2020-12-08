# fuzzy-rater

Fuzzy-rater is a library that can be used to create your own search system. It includes a couple of classes with which a fuzzy search system can be created:

-   [FuzzyRater](#FuzzyRater)
-   [FuzzyWordMatcher](#FuzzyWordMatcher)
-   [FuzzyMultiWordMatcher](#FuzzyMultiWordMatcher)
-   [WordOrderMatcher](#WordOrderMatcher)

Each of the classes (except for WordOrderMatcher) have a relatively large construction time, which increases exponentially with the allowed fuzziness.
Once the class has been constructed, the search text and fuzziness is irrelevant for efficiency.
Getting the score or match data can be done in linear time relative to the text that searched in.

The library takes inspiration from: http://blog.notdot.net/2010/07/Damn-Cool-Algorithms-Levenshtein-Automata.
A "more detailed" explanation can be found in the [system](#system) section.

A live demo as well as benchmarks can be viewed at [tarvk.github.io/fuzzy-rater](https://tarvk.github.io/fuzzy-rater/demo/build/).
The code for the site isn't great, but it may still be useful in order to see how one could use this library for things like result highlighting.

## Installation and usage

The module can be installed using npm:

```
npm install fuzzy-rater
```

After which you can perform basic usage such as:

```ts
import {FuzzyRater} from "fuzzy-rater";
const rater = new FuzzyRater("someting");
const score = rater.getScore("I like something cool");
```

For more advanced usage, the demo can be checked as well as the provided interfaces below.

## Components

### FuzzyRater

The `FuzzyRater` class can be used to rate a given input text according to some given an input query and some given configuration.
This class judges matches based on the number of typos, the order words occurred in, and the distance between the occurrences.

The higher the score is, the worse it matches, it essentially represents the amount of mistakes.
The score can also become negative (depending on configuration) when multiple occurrences are found in the input text.

The class can also be used to extract extended match information which is useful for text highlighting purposes.
This is however significantly slower (but still linearly) than just obtaining the score.

#### Interface

```ts
class FuzzyRater {
    /**
     * Creates a new fuzzy rater
     * @param query The query to be rate with
     * @param config The configuration for how to rate matches
     */
    public constructor(query: string | IFuzzyWordInput[], config?: IFuzzyRateConfig) {}

    /**
     * Computes all relevant match data for the given text
     * @param text The text to get match data for
     * @returns The fuzzy match data, including score and individual components
     */
    public getMatch(text: string): IFuzzyMatch {}

    /**
     * Retrieves the score for a given piece of text
     * @param text The text to be rated
     * @returns A score, where larger is worse
     */
    public getScore(text: string): number {}

    /**
     * Retrieves the match data that can be used for highlighting
     * @param text The text to be matched
     * @returns The scores including match data
     */
    public getMatchData(text: string): IFuzzyMatch & {matchGroups: IMatchGroup[]} {}
}
```

<details>
<summary>
Type definitions
</summary>

```ts
type IFuzzyWordInput = {
    /** The word to match */
    word: string;
    /** The cost of not matching this word */
    skipPenalty?: number;
    /** The maximum allowed mistakes to still yield a match */
    maxDistance?: number;
    /** The bonus when more of these words are found */
    extraBonus?: number;
};
type IFuzzyRateConfig = {
    /**
     * A map of minLength, maxDistance pairs,
     * such that for a string of minLength at most maxDistance mistakes are allowed
     */
    fuzziness?: Record<number, number>;
    /** How much missing a word (or having it out of order) should cost (defaults to 10) */
    skipPenalty?: number;
    /** How much missing a word completely should cost (defaults to 50)*/
    missingPenalty?: number;
    /** How expensive making a single character typo is (defaults to 100) */
    typoPenalty?: number;
    /** The bonus when more of the query words are found (defaults to 5) */
    extraBonus?: number;
};
type IFuzzyMatch = {
    /** The cost of words completely missing */
    missingCost: number;
    /** The cost of words not being in order / far apart */
    orderCost: number;
    /** The bonus of extra matches having been found */
    extraBonus: number;
    /** The combined score (larger is worse) */
    score: number;
};
type IMatchGroup = {
    /** The range of text that this data applies to */
    range: {
        /*^ The start index of the group */
        start: number;
        /*^ The end index of the group */
        end: number;
        /*^ The text of the group */
        text: string;
    };
    /** The data about how this text matches the query */
    relations: IMatchGroupRelationData[];
};
type IMatchGroupRelationData = {
    /**
     * The type of transition
     * - insert: Matches a character that wasn't in the query
     * - skip: Skips a character that was in the query
     * - match: Matches a character in the text with the character in the query
     * - replace: Replaces a query character for another character
     */
    type: "insert" | "skip" | "match" | "replace";
    /** The query word that this data is for*/
    word: IQueryWord;
    /** The range of the text on the query data */
    range: {
        /*^ The start index of the part of the query word */
        start: number;
        /*^ The end index of the part of the query word */
        end: number;
        /*^ The part of the query word */
        text: string;
    };
    /** Whether this match was part of the best match sequence */
    partOfBestOrder: boolean;
};
type IQueryWord = {
    /** The index of the word in the list of query words */
    index: number;
    /** The word itself */
    text: string;
    /** The index at which this text was matched, in the best case order match (-1 representing it not being matched) */
    matchedIndex: number;
};
```

</details>

### FuzzyWordMatcher

The `FuzzyWordMatcher` class can be used to find a single occurrence of a word in a given piece of text accepting a specified maximum number of typos.
It can find the score for the best match (number of typos), as well as match data which can be used for highlighting.

#### Interface

```ts
class FuzzyWordMatcher {
    /**
     * Constructs a new fuzzy word matcher
     * @param word The word to look for
     * @param maxDistance The maximum error
     */
    public constructor(word: string, maxDistance: number) {}

    /**
     * Retrieves the best match in the given text
     * @param text The text to find the query word in
     * @returns Whether the text matched, and the distance from the query word
     */
    public getMatch(text: string): IFuzzyNodeData {}

    /**
     * Retrieves the best match in the given text, and data of how to obtain it
     * @param text The text to find the query word in
     * @returns Whether the text matched, and the distance from the query word, and how the text differed
     */
    public getMatchData(
        text: string
    ): IFuzzyNodeData & {alterations: IFuzzyWordMatch[]} {}
}
```

<details>
<summary>
Type definitions
</summary>

```ts
type IFuzzyNodeData = {
    /** Whether the query was matched */
    matched: boolean;
    /** The distance the match is away from the query */
    distance: number;
};
type IFuzzyWordMatch = {
    /**
     * The type of transition
     * - insert: Matches a character that wasn't in the query
     * - skip: Skips a character that was in the query
     * - match: Matches a character in the text with the character in the query
     * - replace: Replaces a query character for another character
     * - ignore: Any text before or after a query match
     */
    type: "insert" | "skip" | "match" | "replace" | "ignore";
    /** The data specified in the query */
    query: {
        character: string;
        index: number;
    };
    /** The data specified in the target */
    target: {
        character: string;
        index: number;
    };
};
```

</details>

### FuzzyMultiWordMatcher

The `FuzzyMultiWordMatcher` class can be used to find multiple occurrences of a word in a given piece of text accepting a specified maximum number of typos.
It can find the score for the best match (number of typos), as well as match data which can be used for highlighting.

#### Interface

```ts
class FuzzyWordMatcher {
    /**
     * Constructs a new fuzzy word matcher
     * @param word The word to look for
     * @param maxDistance The maximum error
     */
    public constructor(word: string, maxDistance: number) {}

    /**
     * Retrieves the best matches in the given text
     * @param text The text to find the query word in
     * @returns The distances from the query word and indices of the end of the word
     */
    public getMatch(text: string): {endIndex: number; distance: number}[] {}

    /**
     * Retrieves the best matches in the given text, and data of how to obtain it
     * @param text The text to find the query word in
     * @returns The distances from the query word, for each match (no distances = no matches), and how the text differed
     */
    public getMatchData(
        text: string
    ): {distances: number[]; alterations: IFuzzyWordMatch[]} {}
}
```

<details>
<summary>
Type definitions
</summary>

```ts
type IFuzzyWordMatch = {
    /**
     * The type of transition
     * - insert: Matches a character that wasn't in the query
     * - skip: Skips a character that was in the query
     * - match: Matches a character in the text with the character in the query
     * - replace: Replaces a query character for another character
     * - ignore: Any text before or after a query match
     */
    type: "insert" | "skip" | "match" | "replace" | "ignore";
    /** The data specified in the query */
    query: {
        character: string;
        index: number;
    };
    /** The data specified in the target */
    target: {
        character: string;
        index: number;
    };
};
```

</details>

### WordOrderMatcher

The `WordOrderMatcher` class can be used to find the best combination of matches to match the input query.
It takes a sequence of query words as an input, and judges a sequence of matches of these words in a piece of text.
The distance between matches as well as the order of the words is rated.

It can find the score for the best match, as well as match data, i.e. which words actually made up the best match.

#### Interface

```ts
class FuzzyWordMatcher {
    /**
     * Creates a new word matcher
     * @param words The sequence of words to match, and how important each of them is
     */
    public constructor(words: IWordOrderQueryWordInput[]) {}

    /**
     * Creates a new word matcher
     * @param words The sequence of words to match
     * @param penalty How bad missing 1 word from the match is, in comparison to words being `penalty` characters apart
     * - penalty = Infinity: always prefer having all words present in sequence, no matter how far apart
     * - penalty = 0: always prefer having consecutive words, no matter if words are missing
     */
    public constructor(words: string[], penalty?: number) {}

    /**
     * Rates how well the given sequence of words matches the input sequence
     * @param matches The sequence of word matches
     * @returns How well the given input order matches
     */
    public getMatch(matches: IWordOrderMatchInput[]): number {}

    /**
     * Rates how well the given sequence of words matches the input sequence, and returns which were matched
     * @param matches The sequence of word matches
     * @returns How well the given input order matches, and the used matches
     */
    public getMatchData(
        matches: IWordOrderMatchInput[]
    ): {distance: number; matches: IWordOrderMatch[]} {}
}
```

<details>
<summary>
Type definitions
</summary>

```ts
type IWordOrderQueryWordInput = {
    /** The word to be matched */
    word: string;
    /**
     * How bad missing 1 word from the match is, in comparison to words being `penalty` characters apart
     * - penalty = Infinity: always prefer having all words present in sequence, no matter how far apart
     * - penalty = 0: always prefer having consecutive words, no matter if words are missing
     */
    penalty: number;
};
type IWordOrderMatchInput = {
    /** The word that was matched */
    word: string;
    /** The start index of the word */
    index: number;
    /** The end index of the word */
    endIndex: number;
    /** The extra cost associated with this word */
    cost: number;
};
type IWordOrderMatch = {
    /** The index of the word in the query input array */
    wordIndex: number;
    /** The index of the match from the input array */
    matchIndex: number;
    /** The match from the input array */
    match: IWordOrderMatchInput;
};
```

</details>

## System

### Overall operation

The main `FuzzyRater` class takes 2 main steps in judging texts:

-   Find all matches for each individual input word
-   Judge the best order and distance of the best matches

The fuzzy rater has 5 properties that can be configured, either per search word or for all words at once in the config;

-   `maxDistance`: The maximum number of mistakes allowed in a word (called fuzziness in the overall config)
-   `skipPenalty`: The number to increase the score with, if this word wasn't found in sequence
-   `missingPenalty`: The number to increase the score with, if this word wasn't found at all
-   `typoPenalty`: The number to increase the score with per typo, if the word was found in sequence
-   `extraBonus`: The number to decrease the score with, for each additional occurrence of the word (ignores typo costs)
    All these values are relative to the cost of how far words are found apart. E.g. when looking for `something cool`,
    finding `something else cool` would have the search terms 5 characters apart, and thus a score increased with 5.

#### Finding words

The `FuzzyMultiWordMatcher` class is used to find all occurrences of each word, with the specified maximum number of typos.
These matches will then get penalty data associated to them, based on the number of typos and the specified `typoPenalty`. We also figure out how many extra occurrences there are of every wordand apply the `extraBonus` to the score.
We also apply `missingPenalty` in case the word wasn't found at all.

Finally these occurrences are combined into a single list of matches, which can be processed by the order matcher.

#### Judging word matches

The `WordOrderMatcher` class is then used to judge how well the found matches match the input query. It rates both how many words occurred in the right order, as well as how much space was found between words.

It does this based on the `skipPenalty` and the distance between words. It attempts to optimize the score, by choosing the best words to use. This takes `typoPenalty` in consideration too, potentially choosing a word with a typo if it happened to be closer, or match the input order better.

### Fuzzy matching

The most important and useful aspect of this library is the `FuzzyMultiWordMatcher` class. This class is able to find occurrences in linear time to the text that's searched in, totally regardless of search input size and fuzziness. The search input size and fuzziness will however affect the initial construction time. So it's most useful when a lot of possible data has to be queried through to find potential matches, since then the search time will overshadow the construction time.

This class is based on the idea discussed here: http://blog.notdot.net/2010/07/Damn-Cool-Algorithms-Levenshtein-Automata

It essentially uses one level of abstraction to make an efficient matcher instance:

-   Create a relatively easy to understand NFA template to fuzzily find results
-   Convert the NFA template to a DFA template in order to perform matches in linear time

This is essentially what's discussed in the linked article. There it however also used the automaton for efficient trie searches, but tries don't appear applicable for this use case.

Instead this library had to deal with another issue; converting the DFA match data back into relevant word match data:

-   Execute the DFA and keep track of the traced path
-   Use the DFA traced path to find one of the possible original NFA traced paths (and this should be the path with the least number of typos)
-   Use the NFA traced path to extract what characters correctly matched, which were skipped and which were inserted.

Converting this data back was actually quite tricky, and may still contain some mistakes. I have written some basic unit tests to see whether the code works to some degree, but it hasn't been extensively tested. And I didn't take the time to try and prove the correctness of the algorithm either, so there may be fundamental mistakes in it, but it appears to be working for the most part.
