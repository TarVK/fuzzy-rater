import React, {FC, useCallback, useState} from "react";
import {
    DefaultButton,
    Dialog,
    DialogFooter,
    DialogType,
    getTheme,
    IconButton,
    PrimaryButton,
    SpinButton,
    Stack,
    StackItem,
} from "@fluentui/react";

/**
 * An input to configure fuzziness of the fuzzy rater
 */
export const FuzzinessInput: FC<{
    value: Record<number, number>;
    onChange: (fuzzyMap: Record<number, number>) => void;
}> = ({value, onChange}) => {
    const theme = getTheme();
    const [showPrompt, setShowPrompt] = useState(false);
    const openPrompt = useCallback(() => setShowPrompt(true), [setShowPrompt]);
    const closePrompt = useCallback(() => setShowPrompt(false), [setShowPrompt]);

    const [minLength, setMinLength] = useState(1);
    const [fuzziness, setFuzziness] = useState(0);

    const add = useCallback(() => {
        onChange({...value, [minLength]: fuzziness});
        closePrompt();
    }, [minLength, fuzziness, closePrompt]);
    const onDelete = useCallback(
        (key: number) => {
            const {[key]: m, ...rest} = value;
            onChange(rest);
        },
        [value]
    );

    const entries = Object.entries(value)
        .map(([key, value]) => [Number(key), value])
        .sort(([a], [b]) => a - b);
    return (
        <>
            <Dialog
                hidden={!showPrompt}
                onDismiss={closePrompt}
                dialogContentProps={addDialogContent}>
                <SpinButton
                    value={minLength + ""}
                    onValidate={v => setMinLength(Number(v))}
                    onIncrement={v => setMinLength(Math.min(100, Number(v) + 1))}
                    onDecrement={v => setMinLength(Math.max(1, Number(v) - 1))}
                    label={"Min word length"}
                    incrementButtonAriaLabel={"Increase value"}
                    decrementButtonAriaLabel={"Decrease value"}
                />
                <SpinButton
                    value={fuzziness + ""}
                    onValidate={v => setFuzziness(Number(v))}
                    onIncrement={v => setFuzziness(Math.min(20, Number(v) + 1))}
                    onDecrement={v => setFuzziness(Math.max(0, Number(v) - 1))}
                    label={"Fuzziness"}
                    incrementButtonAriaLabel={"Increase value"}
                    decrementButtonAriaLabel={"Decrease value"}
                />
                <DialogFooter>
                    <PrimaryButton onClick={add} text="Add" />
                    <DefaultButton onClick={closePrompt} text="Cancel" />
                </DialogFooter>
            </Dialog>
            <Stack horizontal>
                <StackItem>
                    <IconButton
                        onClick={openPrompt}
                        iconProps={{iconName: "Add"}}
                        title="Add"
                        ariaLabel="Add"
                    />
                </StackItem>
                {entries.map(([key, value]) => (
                    <StackItem key={key}>
                        <Stack
                            horizontal
                            styles={{
                                root: {
                                    boxShadow: theme.effects.elevation4,
                                    marginLeft: 5,
                                },
                            }}>
                            <StackItem
                                align="stretch"
                                styles={{
                                    root: {
                                        backgroundColor: theme.palette.neutralLight,
                                        marginRight: 5,
                                        padding: 7,
                                    },
                                }}>
                                min length: {key}
                            </StackItem>
                            <StackItem align="stretch" styles={{root: {padding: 7}}}>
                                max error: {value}
                            </StackItem>
                            <StackItem>
                                <IconButton
                                    onClick={() => onDelete(key)}
                                    iconProps={{iconName: "ChromeClose"}}
                                    title="Close"
                                    ariaLabel="Close"
                                />
                            </StackItem>
                        </Stack>
                    </StackItem>
                ))}
            </Stack>
        </>
    );
};

const addDialogContent = {
    type: DialogType.largeHeader,
    title: "Add a fuzziness breakpoint",
    subText:
        "Please input how long the word should at least be in order for this fuzziness to be used, and specify the number of typos are allowed at that point. Note that compile time scales exponentially with allowed number of mistakes, so even small numbers may freeze your page.",
};
