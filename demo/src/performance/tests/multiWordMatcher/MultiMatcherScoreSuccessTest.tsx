import React, {FC} from "react";
import {MultiWordMatcherTestSkeleton} from "./MultiWordMatcherTestSkeleton";

export const MultiMatcherScoreSuccessTest: FC = () => (
    <MultiWordMatcherTestSkeleton
        title="Multi word matcher matches score"
        description={
            <>
                A simple test of purely computing the score when all data includes
                matches.
            </>
        }
        code={
            "const matcher = new FuzzyMultiWordMatcher(word, distance); // Compilation\nconst result = matcher.getMatch(text); // Execution"
        }
        init={{
            search: "rotten",
            target:
                "I like to eat a bunch of rottkn black tomatoes at once, but rotten black apples aren't as good.",
            count: 1e5,
            maxDistance: 2,
        }}
        results={{
            compile: 7,
            execute: 510,
        }}
        getAction={(rater, text) => () => rater.getMatch(text)}
        getResult={(rater, text) => {
            const result = rater.getMatch(text);
            return (
                <>
                    End indices: {result.map(({endIndex}) => endIndex).join(", ")} <br />
                    Distances: {result.map(({distance}) => distance).join(", ")} <br />
                </>
            );
        }}
    />
);
