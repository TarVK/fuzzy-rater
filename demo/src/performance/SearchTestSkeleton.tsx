import {
    getTheme,
    IconButton,
    Label,
    ProgressIndicator,
    SpinButton,
    Stack,
    StackItem,
    TextField,
} from "@fluentui/react";
import React, {FC, ReactNode, useMemo, useRef, useState} from "react";
import {Section} from "./Section";

const theme = getTheme();
/**
 * A search test skeleton, such that it can be used for different test types
 */
export const SearchTestSkeleton: FC<{
    description: ReactNode;
    title: string;
    init: {
        search: string;
        target: string;
        count: number;
    };
    results: {
        compile: number;
        execute: number;
        count: number;
        charCount: number;
    };
    run: (search: string, target: string, count: number) => () => void;
    getResult?: (data: {
        ourResult: boolean;
        execTime: number;
        compileTime: number;

        search: string;
        target: string;
        count: number;
        formattedTimes: JSX.Element;
    }) => JSX.Element;
}> = ({
    run,
    description,
    children,
    results: ourResults,
    init,
    title,
    getResult = ({formattedTimes}) => formattedTimes,
}) => {
    const camelCaseTitle = title.replace(/\s(.)/g, (m, g1) => g1.toUpperCase());
    const [search, setSearch] = useState(init.search);
    const [target, setTarget] = useState(init.target);
    const [count, setCount] = useState(init.count);
    const [result, setResult] = useState(undefined as undefined | JSX.Element);
    const running = useRef(false);
    const [progress, setProgress] = useState(0);

    const ourResult = useMemo(() => {
        return getResult({
            ourResult: true,
            search: init.search,
            target: init.target,
            count: init.count,
            execTime: ourResults.execute,
            compileTime: ourResults.compile,
            formattedTimes: (
                <StandardResult
                    executionTime={ourResults.execute}
                    compilationTime={ourResults.compile}
                    count={init.count}
                    charCount={target.length}
                />
            ),
        });
    }, [
        init.count,
        init.search,
        init.target,
        ourResults.compile,
        ourResults.execute,
        ourResults.count,
    ]);

    const startTest = async () => {
        setResult(undefined);
        running.current = true;
        let compileTime = -Date.now();
        const exec = run(search, target, count);
        compileTime += Date.now();

        let execTime = 0;
        let start = Date.now();
        for (let i = 0; i < count; i++) {
            if (Date.now() - start > 20) {
                await new Promise(res => setTimeout(res, 0));
                start = Date.now();
                if (!running.current) return;
                setProgress(i / (count - 1));
            }
            execTime -= Date.now();
            exec();
            execTime += Date.now();
        }
        setProgress(1);

        // Store the result
        setResult(
            getResult({
                ourResult: false,
                search,
                target,
                count,
                execTime,
                compileTime,
                formattedTimes: (
                    <StandardResult
                        executionTime={execTime}
                        compilationTime={compileTime}
                        count={count}
                        charCount={target.length}
                    />
                ),
            })
        );
    };
    const stopTest = () => {
        running.current = false;
        setProgress(0);
    };

    return (
        <div
            style={{
                boxShadow: theme.effects.elevation8,
                backgroundColor: "#fff",
                margin: 5,
            }}>
            <Section title={title} id={camelCaseTitle}>
                {description}
            </Section>

            <Section title="Configuration" collapsible initExpanded={false}>
                <TextField
                    label="Search term"
                    value={search}
                    onChange={(e, v) => v && setSearch(v)}
                />
                <TextField
                    label="Target text"
                    value={target}
                    multiline
                    styles={{field: {resize: "vertical"}}}
                    onChange={(e, v) => v && setTarget(v)}
                />
                <SpinButton
                    styles={{root: {marginTop: 5}}}
                    value={count + ""}
                    onValidate={v => setCount(Number(v))}
                    onIncrement={v => setCount(Math.min(1e7, Number(v) + 1e3))}
                    onDecrement={v => setCount(Math.max(10, Number(v) - 1e3))}
                    label={"Execute count"}
                    incrementButtonAriaLabel={"Increase value"}
                    decrementButtonAriaLabel={"Decrease value"}
                />
                {children}
            </Section>

            <Section title="Results">
                <Stack horizontal verticalAlign="center">
                    <StackItem>
                        <IconButton
                            onClick={startTest}
                            iconProps={{iconName: "Play"}}
                            title="Execute"
                            ariaLabel="Execute"
                        />
                    </StackItem>
                    <StackItem>
                        <IconButton
                            onClick={stopTest}
                            iconProps={{iconName: "Stop"}}
                            title="Stop"
                            ariaLabel="Stop"
                        />
                    </StackItem>
                    <StackItem grow={1} align="center">
                        <ProgressIndicator percentComplete={progress} />
                    </StackItem>
                </Stack>
                <Stack horizontal verticalAlign="start">
                    <StackItem grow={1}>
                        <Section title="Our results" subSection>
                            {ourResult}
                        </Section>
                    </StackItem>
                    <StackItem grow={1}>
                        <Section title="Your results" subSection>
                            {result}
                        </Section>
                    </StackItem>
                </Stack>
            </Section>
        </div>
    );
};

export const StandardResult: FC<{
    compilationTime: number;
    executionTime: number;
    count: number;
    charCount: number;
}> = ({compilationTime, executionTime, count, charCount}) => (
    <div>
        <Label>Compilation time:</Label>
        <span style={{color: theme.palette.themePrimary}}>{compilationTime}</span> ms
        <Label>Execution time:</Label>
        <span style={{color: theme.palette.themePrimary}}>{executionTime}</span> ms total
        <br />
        <span style={{color: theme.palette.themePrimary}}>
            {Math.round((executionTime / count) * 1e3) / 1e3}
        </span>{" "}
        ms per execution
        <br />
        <span style={{color: theme.palette.themePrimary}}>
            {Math.round((executionTime / (count * charCount)) * 1e4 * 1e3) / 1e3}
        </span>{" "}
        ms per 10k characters
    </div>
);
