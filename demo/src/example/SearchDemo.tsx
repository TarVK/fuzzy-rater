import React, {FC, useCallback, useMemo, useState, KeyboardEvent} from "react";
import {FuzzyRater} from "fuzzy-rater";
import Color from "color";
import {SearchField} from "./SearchField";
import {searchTexts} from "./searchTexts";
import {SearchResult} from "./SearchResult";
import {
    DefaultButton,
    Dialog,
    DialogFooter,
    DialogType,
    getTheme,
    IconButton,
    PrimaryButton,
    Stack,
    StackItem,
    TextField,
} from "@fluentui/react";

const theme = getTheme();

/**
 * A simple search demo
 */
export const SearchDemo: FC = () => {
    const [search, setSearch] = useState("");
    const [texts, setTexts] = useState(searchTexts);
    const [threshold, setThreshold] = useState(50);

    const {rater, results} = useMemo(() => {
        if (search == "") {
            return {
                rater: null,
                results: texts.map((text, index) => ({score: 0, text, index})),
            };
        }
        const rater = new FuzzyRater(search);

        const rated = texts
            .map((text, index) => ({score: rater.getScore(text), text, index}))
            .filter(({score}) => score < threshold);
        rated.sort(({score: a}, {score: b}) => a - b);
        return {rater, results: rated};
    }, [search, texts]);

    const deleteAll = useCallback(() => setTexts([]), [setTexts]);
    const deleteText = (index: number) => {
        setTexts([...texts.slice(0, index), ...texts.slice(index + 1)]);
    };
    const updateText = (index: number, text: string) => {
        setTexts([...texts.slice(0, index), text, ...texts.slice(index + 1)]);
    };

    return (
        <div style={{boxShadow: theme.effects.elevation8}}>
            <Stack
                horizontal
                verticalAlign="center"
                styles={{
                    root: {boxShadow: theme.effects.elevation8, background: "#fff"},
                }}>
                <StackItem align="stretch" grow>
                    <SearchField
                        getColor={getColor}
                        value={search}
                        onChange={setSearch}
                    />
                </StackItem>
                <StackItem>
                    <AddButton texts={texts} setTexts={setTexts} />
                </StackItem>
                <StackItem>
                    <IconButton
                        onClick={deleteAll}
                        iconProps={{iconName: "ChromeClose"}}
                        title="Delete all"
                        ariaLabel="Delete all texts"
                    />
                </StackItem>
            </Stack>
            <div style={{maxHeight: 600, overflow: "auto"}}>
                {results.map(({text, index}) => (
                    <SearchResult
                        key={index}
                        ID={index}
                        rater={rater}
                        getColor={getColor}
                        onDelete={() => deleteText(index)}
                        onChange={text => updateText(index, text)}>
                        {text}
                    </SearchResult>
                ))}
            </div>
        </div>
    );
};

const addDialogContent = {
    type: DialogType.largeHeader,
    title: "Add a search text",
    subText: "Please enter the text to be added to the search list",
};
/**
 * The button and dialog that can add a new text to the inputs
 */
const AddButton: FC<{texts: string[]; setTexts: (texts: string[]) => void}> = ({
    texts,
    setTexts,
}) => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [text, setText] = useState("");
    const onChange = useCallback((e: any, text: string) => setText(text), [setText]);
    const openPrompt = useCallback(() => setShowPrompt(true), [setShowPrompt]);
    const closePrompt = useCallback(() => setShowPrompt(false), [setShowPrompt]);
    const add = useCallback(() => {
        closePrompt();
        setTexts([text, ...texts]);
        setText("");
    }, [text, texts]);
    const onKey = useCallback(
        (event: KeyboardEvent) => {
            if (event.key == "Enter") add();
        },
        [add]
    );

    return (
        <>
            <Dialog
                hidden={!showPrompt}
                onDismiss={closePrompt}
                dialogContentProps={addDialogContent}>
                <TextField
                    value={text}
                    onChange={onChange}
                    underlined
                    onKeyDown={onKey}
                />
                <DialogFooter>
                    <PrimaryButton onClick={add} text="Add" />
                    <DefaultButton onClick={closePrompt} text="Cancel" />
                </DialogFooter>
            </Dialog>
            <IconButton
                onClick={openPrompt}
                iconProps={{iconName: "Add"}}
                title="Add text"
                ariaLabel="Add text"
            />
        </>
    );
};

/**
 * Retrieves a color based on an index
 * @param index The index of the color to retrieve
 * @returns The color
 */
export function getColor(index: number): string {
    return Color.hsv(150 + index * 10, 100, 100).toString();
}
