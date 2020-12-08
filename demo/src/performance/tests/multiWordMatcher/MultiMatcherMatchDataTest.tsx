import React, {FC} from "react";
import ReactJson from "react-json-view";
import {MultiWordMatcherTestSkeleton} from "./MultiWordMatcherTestSkeleton";

export const MultiMatcherMatchDataTest: FC = () => (
    <MultiWordMatcherTestSkeleton
        title="Multi word matcher match data"
        description={
            <>
                A simple test to compute the score as well as extended match data usable
                for highlighting.
            </>
        }
        code={
            "const matcher = new FuzzyMultiWordMatcher(word, distance); // Compilation\nconst result = matcher.getMatchData(text); // Execution"
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
            execute: 4269,
        }}
        getAction={(rater, text) => () => rater.getMatchData(text)}
        getResult={(rater, text) => {
            const result = rater.getMatchData(text);
            return (
                <>
                    Distances: {result.distances.join(", ")} <br />
                    Alterations:{" "}
                    <ReactJson
                        src={result.alterations}
                        collapsed
                        theme="grayscale:inverted"
                        displayDataTypes={false}
                    />
                </>
            );
        }}
    />
);
