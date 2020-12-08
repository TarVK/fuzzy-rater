import React, {FC} from "react";
import ReactJson from "react-json-view";
import {MultiWordMatcherTestSkeleton} from "./MultiWordMatcherTestSkeleton";

export const MultiMatcherScoreLinearTest: FC = () => (
    <MultiWordMatcherTestSkeleton
        title="Multi word matcher linear time score"
        description={
            <>
                The same test as before where we find a proper match, but now fewer times
                on larger strings, instead of more times on smaller strings. This shows
                that matching really does take only linear time.
            </>
        }
        code={
            "const matcher = new FuzzyMultiWordMatcher(word, distance); // Compilation\nconst result = matcher.getMatch(text); // Execution"
        }
        init={{
            search: "rotten",
            target: "I like to eat a bunch of rottkn black tomatoes at once, but rotten black apples aren't as good.".repeat(
                1e2
            ),
            count: 1e3,
            maxDistance: 2,
        }}
        results={{
            compile: 7,
            execute: 583,
        }}
        getAction={(rater, text) => () => rater.getMatch(text)}
        hideMatch
        getResult={(rater, text) => {
            const result = rater.getMatch(text);
            return (
                <>
                    End indices:
                    <ReactJson
                        src={result.map(({endIndex}) => endIndex)}
                        collapsed
                        theme="grayscale:inverted"
                        displayDataTypes={false}
                    />
                    Distances:
                    <ReactJson
                        src={result.map(({distance}) => distance)}
                        collapsed
                        theme="grayscale:inverted"
                        displayDataTypes={false}
                    />
                </>
            );
        }}
    />
);
