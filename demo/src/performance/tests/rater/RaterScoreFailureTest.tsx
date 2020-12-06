import React, {FC} from "react";
import {RaterScoreTestSkeleton} from "./RaterScoreTestSkeleton";

export const RaterScoreFailureTest: FC = () => (
    <RaterScoreTestSkeleton
        title="Rater no matches score"
        description={
            <>
                A simple test of computing purely the score when data doesn't match, and
                some steps can be skipped.
            </>
        }
        init={{
            search: "rotten black tomatoes",
            target:
                "I like to have a good time in the pool with my friends. I however, do unfortunately not have any friends.",
            count: 1e5,
            fuzziness: {0: 0, 3: 1, 5: 2},
        }}
        results={{
            compile: 30,
            execute: 1622,
            count: 1e5,
            charCount: 105,
        }}
        getAction={(rater, text) => () => rater.getScore(text)}
        getResult={(rater, text) => <>Score: {rater.getScore(text)}</>}
    />
);
