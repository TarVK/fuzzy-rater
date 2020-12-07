import {Label, SpinButton} from "@fluentui/react";
import {FuzzyWordMatcher} from "fuzzy-rater";
import React, {FC, ReactNode, useCallback, useState} from "react";
import {SearchTestSkeleton} from "../../SearchTestSkeleton";
import {getColor} from "../../../example/SearchDemo";
import {HighlightWordMatch} from "./HighlightWordMatch";

/**
 * A skeleton that can be used to make generic rater tests
 */
export const WordMatcherTestSkeleton: FC<{
    title: string;
    description: ReactNode;
    results: {compile: number; execute: number; count: number; charCount: number};
    init: {
        search: string;
        target: string;
        count: number;
        maxDistance: number;
    };
    hideMatch?: boolean;
    getAction: (matcher: FuzzyWordMatcher, text: string) => () => void;
    getResult?: (matcher: FuzzyWordMatcher, text: string) => JSX.Element;
}> = ({
    title,
    description,
    init,
    results,
    getAction,
    getResult: getExtraResult,
    hideMatch,
}) => {
    const [maxDistance, setMaxDistance] = useState(init.maxDistance);
    const getResult = useCallback(
        ({target, search, formattedTimes, ourResult}) => {
            const matcher = new FuzzyWordMatcher(
                search,
                ourResult ? init.maxDistance : maxDistance
            );
            return (
                <>
                    {formattedTimes}
                    {(!hideMatch || getExtraResult) && <Label>Match</Label>}
                    {!hideMatch && (
                        <>
                            <HighlightWordMatch matcher={matcher} getColor={getColor}>
                                {target}
                            </HighlightWordMatch>
                            <br />
                        </>
                    )}
                    {getExtraResult && getExtraResult(matcher, target)}
                </>
            );
        },
        [maxDistance]
    );
    return (
        <SearchTestSkeleton
            title={title}
            description={description}
            results={results}
            init={init}
            run={(search, text) => {
                const matcher = new FuzzyWordMatcher(search, maxDistance);
                return getAction(matcher, text);
            }}
            getResult={getResult}>
            <SpinButton
                styles={{root: {marginTop: 5}}}
                value={maxDistance + ""}
                onValidate={v => setMaxDistance(Number(v))}
                onIncrement={v => setMaxDistance(Math.min(20, Number(v) + 1))}
                onDecrement={v => setMaxDistance(Math.max(0, Number(v) - 1))}
                label={"Max number of mistakes"}
                incrementButtonAriaLabel={"Increase value"}
                decrementButtonAriaLabel={"Decrease value"}
            />
        </SearchTestSkeleton>
    );
};
