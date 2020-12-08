import {getTheme, Label} from "@fluentui/react";
import {FuzzyRater, IWordOrderMatchInput, WordOrderMatcher} from "fuzzy-rater";
import React, {FC, ReactNode, useCallback} from "react";
import {HighlightQuery} from "../../../example/HighlightQuery";
import {getColor} from "../../../example/SearchDemo";
import {SearchTestSkeleton} from "../../SearchTestSkeleton";

const theme = getTheme();

/**
 * A generic skeleton that can be used to make order matcher tests
 */
export const OrderMatcherTestSkeleton: FC<{
    title: string;
    description: ReactNode;
    code: string;
    results: {compile: number; execute: number};
    init: {
        search: string;
        target: string;
        count: number;
    };
    getAction: (matcher: WordOrderMatcher, words: IWordOrderMatchInput[]) => () => void;
    getResult?: (matcher: WordOrderMatcher, words: IWordOrderMatchInput[]) => JSX.Element;
}> = ({
    title,
    description,
    init,
    results,
    getAction,
    getResult: getExtraResult,
    code,
}) => {
    const getInput = useCallback((search: string, text: string) => {
        // Extract some intermediate data from the fuzzy rater (should really extend the class and expose the method, this is a just a dirty quick hack)
        const rater = new FuzzyRater(search);
        return {
            rater,
            input: (rater as any).getWordMatches(text).matches as IWordOrderMatchInput[],
        };
    }, []);

    const getResult = useCallback(
        ({
            target,
            search,
            count,
            execTime,
            compileTime,
        }: {
            target: string;
            search: string;
            count: number;
            execTime: number;
            compileTime: number;
        }) => {
            const {rater, input} = getInput(search, target);
            const matcher = new WordOrderMatcher(search.split(" "));
            const output = matcher.getMatch(input);
            return (
                <>
                    <Label>Compilation time:</Label>
                    <span style={{color: theme.palette.themePrimary}}>
                        {compileTime}
                    </span>{" "}
                    ms
                    <Label>Execution time:</Label>
                    <span style={{color: theme.palette.themePrimary}}>{execTime}</span> ms
                    total
                    <br />
                    <span style={{color: theme.palette.themePrimary}}>
                        {Math.round((execTime / count) * 1e3) / 1e3}
                    </span>{" "}
                    ms per execution
                    <br />
                    <Label>Match</Label>
                    <HighlightQuery rater={rater} getColor={getColor} onlyBest>
                        {target}
                    </HighlightQuery>
                    <br />
                    Score: {output} <br />
                    {getExtraResult && getExtraResult(matcher, input)}
                </>
            );
        },
        [getInput]
    );
    return (
        <SearchTestSkeleton
            title={title}
            description={description}
            code={code}
            results={results}
            init={init}
            getRunner={(search, text) => {
                const {input} = getInput(search, text);
                return () => {
                    const matcher = new WordOrderMatcher(search.split(" "));
                    return getAction(matcher, input);
                };
            }}
            getResult={getResult}></SearchTestSkeleton>
    );
};
