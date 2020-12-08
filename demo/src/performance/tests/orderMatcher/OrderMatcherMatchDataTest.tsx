import React, {FC} from "react";
import ReactJson from "react-json-view";
import {OrderMatcherTestSkeleton} from "./OrderMatcherTestSkeleton";

export const OrderMatcherMatchDataTest: FC = () => (
    <OrderMatcherTestSkeleton
        title="Order matcher match data"
        description={
            <>
                A simple test to compute the score as well as extended match data usable
                for highlighting.
            </>
        }
        code={
            'const matcher = new WordOrderMatcher(search.split(" ")); // Compilation\nconst result = matcher.getMatchData(matches); // Execution'
        }
        init={{
            search: "rotten black tomatoes",
            target:
                "I like to tomato a bunch of rottkn black tomatoes at once, but rotten black apples aren't as good.",
            count: 1e5,
        }}
        results={{
            compile: 0,
            execute: 290,
        }}
        getAction={(rater, matches) => () => rater.getMatchData(matches)}
        getResult={(rater, matches) => {
            const result = rater.getMatchData(matches);
            return (
                <>
                    Match data:
                    <ReactJson
                        src={result}
                        collapsed
                        theme="grayscale:inverted"
                        displayDataTypes={false}
                    />
                </>
            );
        }}
    />
);
