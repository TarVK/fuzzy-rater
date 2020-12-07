import React, {FC} from "react";
import {MultiWordMatcherTestSkeleton} from "./MultiWordMatcherTestSkeleton";

export const MultiMatcherScoreFailureTest: FC = () => (
    <MultiWordMatcherTestSkeleton
        title="Multi word matcher no matches score"
        description={
            <>
                A simple test of computing purely the score when data doesn't match, which
                shouldn't affect performance.
            </>
        }
        init={{
            search: "rotten",
            target:
                "I like to eat a bunch of smoked black tomatoes at once, but smoked black apples aren't as good.",
            count: 1e5,
            maxDistance: 2,
        }}
        results={{
            compile: 7,
            execute: 493,
            count: 1e5,
            charCount: 95,
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
