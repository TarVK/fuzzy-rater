import {Label, SpinButton} from "@fluentui/react";
import {FuzzyMultiWordMatcher} from "fuzzy-rater";
import React, {FC, ReactNode, useCallback, useState} from "react";
import {SearchTestSkeleton} from "../../SearchTestSkeleton";
import {getColor} from "../../../example/SearchDemo";
import {HighlightWordMatch} from "../wordMatcher/HighlightWordMatch";

/**
 * A generic skeleton that can be used to make muli word matcher tests
 */
export const MultiWordMatcherTestSkeleton: FC<{
    title: string;
    description: ReactNode;
    code: string;
    results: {compile: number; execute: number};
    init: {
        search: string;
        target: string;
        count: number;
        maxDistance: number;
    };
    hideMatch?: boolean;
    getAction: (matcher: FuzzyMultiWordMatcher, text: string) => () => void;
    getResult?: (matcher: FuzzyMultiWordMatcher, text: string) => JSX.Element;
}> = ({
    title,
    description,
    code,
    init,
    results,
    getAction,
    getResult: getExtraResult,
    hideMatch,
}) => {
    const [maxDistance, setMaxDistance] = useState(init.maxDistance);
    const getResult = useCallback(
        ({
            target,
            search,
            formattedTimes,
            ourResult,
        }: {
            target: string;
            search: string;
            formattedTimes: ReactNode;
            ourResult: boolean;
        }) => {
            const matcher = new FuzzyMultiWordMatcher(
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
            code={code}
            results={results}
            init={init}
            getRunner={(search, text) => () => {
                const matcher = new FuzzyMultiWordMatcher(search, maxDistance);
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
