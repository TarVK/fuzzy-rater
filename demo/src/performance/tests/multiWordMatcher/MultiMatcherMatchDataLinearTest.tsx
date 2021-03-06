import React, {FC} from "react";
import ReactJson from "react-json-view";
import {MultiWordMatcherTestSkeleton} from "./MultiWordMatcherTestSkeleton";

export const MultiMatcherMatchDataLinearTest: FC = () => (
    <MultiWordMatcherTestSkeleton
        title="Multi word matcher linear time match data"
        description={
            <>
                A simple test to compute the score as well as extended match data usable
                for highlighting, but now fewer times on larger strings, instead of more
                times on smaller strings. This shows that matching really does take only
                linear time.
            </>
        }
        code={
            "const matcher = new FuzzyMultiWordMatcher(word, distance); // Compilation\nconst result = matcher.getMatchData(text); // Execution"
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
            execute: 4227,
        }}
        getAction={(rater, text) => () => rater.getMatchData(text)}
        hideMatch
        getResult={(rater, text) => {
            const result = rater.getMatchData(text);
            return (
                <>
                    Distances:
                    <ReactJson
                        src={result.distances}
                        collapsed
                        theme="grayscale:inverted"
                        displayDataTypes={false}
                    />
                </>
            );
        }}
    />
);
