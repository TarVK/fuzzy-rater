import React, {FC} from "react";
import {RaterTestSkeleton} from "./RaterTestSkeleton";

export const RaterScoreLinearTest: FC = () => (
    <RaterTestSkeleton
        title="Rater linear time score"
        description={
            <>
                The same test as before where we find a proper match, but now fewer times
                on larger strings, instead of more times on smaller strings. This shows
                that matching really does take only linear time.
            </>
        }
        init={{
            search: "rotten black tomatoes",
            target: "I like to eat a bunch of rotten black tomatoes at once, but rotten black apples aren't as good.".repeat(
                1e2
            ),
            count: 1e3,
            fuzziness: {0: 0, 3: 1, 5: 2},
        }}
        results={{
            compile: 30,
            execute: 3612,
            count: 1e3,
            charCount: 95 * 1e2,
        }}
        hideMatch
        getAction={(rater, text) => () => rater.getScore(text)}
        getResult={(rater, text) => <>Score: {rater.getScore(text)}</>}
    />
);
