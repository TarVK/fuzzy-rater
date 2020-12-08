import React, {FC} from "react";
import {WordMatcherTestSkeleton} from "./WordMatcherTestSkeleton";

export const MatcherScoreFailureTest: FC = () => (
    <WordMatcherTestSkeleton
        title="Word matcher no matches score"
        description={
            <>
                A simple test of computing purely the score when data doesn't match, which
                shouldn't affect performance.
            </>
        }
        code={
            "const matcher = new FuzzyWordMatcher(word, distance); // Compilation\nconst result = matcher.getMatch(text); // Execution"
        }
        init={{
            search: "rotten",
            target:
                "I like to eat a bunch of smoked black tomatoes at once, but smoked black apples aren't as good.",
            count: 1e5,
            maxDistance: 2,
        }}
        results={{
            compile: 19,
            execute: 309,
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
