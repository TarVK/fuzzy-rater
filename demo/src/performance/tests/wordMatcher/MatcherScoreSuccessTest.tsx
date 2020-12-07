import React, {FC} from "react";
import {WordMatcherTestSkeleton} from "./WordMatcherTestSkeleton";

export const MatcherScoreSuccessTest: FC = () => (
    <WordMatcherTestSkeleton
        title="Word matcher matches score"
        description={
            <>
                A simple test of purely computing the score when all data includes
                matches.
            </>
        }
        init={{
            search: "rotten",
            target:
                "I like to eat a bunch of rottkn black tomatoes at once, but rotten black apples aren't as good.",
            count: 1e5,
            maxDistance: 2,
        }}
        results={{
            compile: 19,
            execute: 311,
            count: 1e5,
            charCount: 95,
        }}
        getAction={(rater, text) => () => rater.getMatch(text)}
        getResult={(rater, text) => {
            const result = rater.getMatch(text);
            return (
                <>
                    Matched: {result.matched.toString()} <br />
                    Distance: {result.distance}
                </>
            );
        }}
    />
);
