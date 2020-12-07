import React, {FC, useEffect, useState} from "react";
import {FuzzyRater} from "fuzzy-rater";
import Color from "color";
import {updateQueue} from "./updateQueue";

const errorColor = new Color("#F55");

/**
 * A component to highlight text with
 */
export const HighlightQuery: FC<{
    rater: FuzzyRater;
    children: string;
    getColor: (index: number) => string;
}> = ({rater, children, getColor}) => {
    const [words, setWords] = useState([children] as (string | JSX.Element)[]);

    useEffect(() => {
        // This queue makes a huge impact on performance, while not really affecting visual performance
        // I think it's actually react causing the big lag due to the amount of required updates, rather than my library itself, but I am not a 100% positive
        return updateQueue.add(() => {
            const groups = rater.getMatchData(children).matchGroups;

            // Add the highlight color to each group
            const higlighted = groups.map((group, i) => {
                return group.relations.reduce((combined, relation) => {
                    const baseColor = getColor(relation.word.index);
                    const exactColor =
                        relation.type == "match"
                            ? baseColor
                            : new Color(baseColor).mix(errorColor, 0.8).toString();
                    return (
                        <span
                            key={i}
                            style={{
                                padding: 2,
                                minHeight: "1em",
                                verticalAlign: "baseline",
                                display: "inline-block",
                                whiteSpace: "pre-wrap",
                                backgroundColor: exactColor,
                            }}>
                            {combined == "" ? "_" : combined}
                        </span>
                    );
                }, group.range.text as string | JSX.Element);
            });

            setWords(higlighted);
        });
    }, [children, rater]);
    // const words = useMemo(() => {
    // }, [children, rater]);

    return words.length == 0 ? <>{children}</> : <>{words}</>;
};
