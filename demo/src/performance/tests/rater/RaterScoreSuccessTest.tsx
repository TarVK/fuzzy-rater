import React, {FC} from "react";
import {Call} from "../../Call";
import {RaterTestSkeleton} from "./RaterTestSkeleton";

export const RaterScoreSuccessTest: FC = () => (
    <RaterTestSkeleton
        title="Rater matches score"
        code={
            "const rater = new FuzzyRater(search, settings); // Compilation\nconst result = rater.getScore(text); // Execution"
        }
        description={
            <>
                A simple test of purely computing the score when all data includes
                matches.
            </>
        }
        init={{
            search: "rotten black tomatoes",
            target:
                "I like to eat a bunch of rotten black tomatoes at once, but rotten black apples aren't as good.",
            count: 1e5,
            fuzziness: {0: 0, 3: 1, 5: 2},
        }}
        results={{
            compile: 30,
            execute: 3469,
        }}
        getAction={(rater, text) => () => rater.getScore(text)}
        getResult={(rater, text) => <>Score: {rater.getScore(text)}</>}
    />
);
