import React, {FC} from "react";
import {RaterTestSkeleton} from "./RaterTestSkeleton";
import ReactJson from "react-json-view";

export const RaterMatchDataTest: FC = () => (
    <RaterTestSkeleton
        title="Rater match data"
        description={
            <>
                A simple test to compute the score as well as extended match data usable
                for highlighting.
            </>
        }
        code={
            "const rater = new FuzzyRater(search, settings); // Compilation\nconst result = rater.getMatchData(text); // Execution"
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
            execute: 13879,
        }}
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
