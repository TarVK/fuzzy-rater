import React, {FC} from "react";
import {OrderMatcherTestSkeleton} from "./OrderMatcherTestSkeleton";

export const OrderMatcherScoreSuccessTest: FC = () => (
    <OrderMatcherTestSkeleton
        title="Order matcher matches score"
        description={
            <>
                A simple test of purely computing the score when all data includes
                matches.
            </>
        }
        code={
            'const matcher = new WordOrderMatcher(search.split(" ")); // Compilation\nconst result = matcher.getMatch(matches); // Execution'
        }
        init={{
            search: "rotten black tomatoes",
            target:
                "I like to tomato a bunch of rottkn black tomatoes at once, but rotten black apples aren't as good.",
            count: 1e5,
        }}
        results={{
            compile: 0,
            execute: 263,
        }}
        getAction={(rater, matches) => () => rater.getMatch(matches)}
    />
);
