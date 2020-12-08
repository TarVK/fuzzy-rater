import {Label} from "@fluentui/react";
import {FuzzyRater} from "fuzzy-rater";
import React, {FC, ReactNode, useCallback, useState} from "react";
import {HighlightQuery} from "../../../example/HighlightQuery";
import {SearchTestSkeleton} from "../../SearchTestSkeleton";
import {FuzzinessInput} from "./FuzzinessInput";
import {getColor} from "../../../example/SearchDemo";

/**
 * A generic skeleton that can be used to make rater tests
 */
export const RaterTestSkeleton: FC<{
    title: string;
    description: ReactNode;
    code: string;
    results: {compile: number; execute: number};
    init: {
        search: string;
        target: string;
        count: number;
        fuzziness: Record<number, number>;
    };
    hideMatch?: boolean;
    getAction: (rater: FuzzyRater, text: string) => () => void;
    getResult?: (rater: FuzzyRater, text: string) => JSX.Element;
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
    const [fuzziness, setFuzziness] = useState(init.fuzziness);
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
            const rater = new FuzzyRater(search, {
                fuzziness: ourResult ? init.fuzziness : fuzziness,
            });
            return (
                <>
                    {formattedTimes}
                    {(!hideMatch || getExtraResult) && <Label>Match</Label>}
                    {!hideMatch && (
                        <>
                            <HighlightQuery rater={rater} getColor={getColor}>
                                {target}
                            </HighlightQuery>
                            <br />
                        </>
                    )}
                    {getExtraResult && getExtraResult(rater, target)}
                </>
            );
        },
        [fuzziness]
    );
    return (
        <SearchTestSkeleton
            code={code}
            title={title}
            description={description}
            results={results}
            init={init}
            getRunner={(search, text) => () => {
                const rater = new FuzzyRater(search, {fuzziness});
                return getAction(rater, text);
            }}
            getResult={getResult}>
            <Label>Fuzziness</Label>
            <FuzzinessInput value={fuzziness} onChange={setFuzziness} />
        </SearchTestSkeleton>
    );
};
