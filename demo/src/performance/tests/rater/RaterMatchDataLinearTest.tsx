import React, {FC} from "react";
import {RaterScoreTestSkeleton} from "./RaterScoreTestSkeleton";
import ReactJson from "react-json-view";

export const RaterMatchDataLinearTest: FC = () => (
    <RaterScoreTestSkeleton
        title="Rater linear time match data"
        description={
            <>
                A simple test to compute the score as well as extended match data usable
                for highlighting, but now fewer times on larger strings, instead of more
                times on smaller strings. This shows that matching really does take only
                linear time.
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
            execute: 26472,
            count: 1e5,
            charCount: 95,
        }}
        hideMatch
        getAction={(rater, text) => () => rater.getMatchData(text)}
        getResult={(rater, text) => {
            const data = rater.getMatchData(text);

            return (
                <>
                    Score: {data.score} (Order + Missing - Bonus) <br />
                    Order: {data.orderCost}
                    <br />
                    Missing: {data.missingCost}
                    <br />
                    Bonus: {data.extraBonus}
                    <br />
                    Match groups:{" "}
                    <ReactJson
                        src={data.matchGroups}
                        collapsed
                        theme="grayscale:inverted"
                        displayDataTypes={false}
                    />
                </>
            );
        }}
    />
);
