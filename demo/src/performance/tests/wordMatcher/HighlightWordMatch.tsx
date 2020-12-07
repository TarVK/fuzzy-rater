import React, {FC, useEffect, useState} from "react";
import {addAlterationData, FuzzyMultiWordMatcher, FuzzyWordMatcher} from "fuzzy-rater";
import Color from "color";
import {updateQueue} from "../../../example/updateQueue";

const errorColor = new Color("#F55");

/**
 * A component to highlight text with
 */
export const HighlightWordMatch: FC<{
    matcher: FuzzyWordMatcher | FuzzyMultiWordMatcher;
    children: string;
    getColor: (index: number) => string;
}> = ({matcher, children, getColor}) => {
    const [words, setWords] = useState([children] as (string | JSX.Element)[]);

    useEffect(() => {
        // This queue makes a huge impact on performance, while not really affecting visual performance
        // I think it's actually react causing the big lag due to the amount of required updates, rather than my library itself, but I am not a 100% positive
        return updateQueue.add(() => {
            const data = matcher.getMatchData(children);
            const groups = addAlterationData([], data.alterations, {
                index: 0,
                matchedIndex: -1,
                text: matcher.word,
            });

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
    }, [children, matcher]);
    // const words = useMemo(() => {
    // }, [children, rater]);

    return words.length == 0 ? <>{children}</> : <>{words}</>;
};
