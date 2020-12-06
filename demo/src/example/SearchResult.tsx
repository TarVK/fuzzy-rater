import React, {FC, useCallback, useState} from "react";
import {getTheme, IconButton, Stack, StackItem, TextField} from "@fluentui/react";
import {FuzzyRater} from "fuzzy-rater";
import {HighlightText} from "./HighlightText";

const theme = getTheme();
/**
 * A search result, which also allows for editing of the text
 */
export const SearchResult: FC<{
    ID: number;
    rater: FuzzyRater | null;
    getColor: (index: number) => string;
    children: string;
    onChange: (text: string) => void;
    onDelete: () => void;
}> = ({ID, rater, getColor, children, onChange, onDelete}) => {
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(children);
    const onTextChange = (event: any, text: string) => setEditText(text);
    const toggleEditing = useCallback(() => {
        const newEditing = !editing;
        setEditing(newEditing);
        if (newEditing) {
            setEditText(children);
        } else {
            onChange(editText);
        }
    }, [editing, children, editText]);

    return (
        <div style={{boxShadow: theme.effects.elevation4, background: "#fff", margin: 5}}>
            <Stack horizontal verticalAlign="center">
                <StackItem
                    align="stretch"
                    styles={{
                        root: {
                            minWidth: 30,
                            backgroundColor: theme.palette.neutralLight,
                            marginRight: 5,
                        },
                    }}>
                    <span style={{display: "inline-block", padding: 5}}>{ID}</span>
                </StackItem>
                <StackItem grow={1} align="center">
                    {editing ? (
                        <TextField value={editText} onChange={onTextChange} />
                    ) : rater ? (
                        <HighlightText rater={rater} getColor={getColor}>
                            {children}
                        </HighlightText>
                    ) : (
                        children
                    )}
                </StackItem>
                <StackItem>
                    <IconButton
                        onClick={toggleEditing}
                        iconProps={{iconName: "Edit"}}
                        title="Edit"
                        ariaLabel="Edit"
                    />
                </StackItem>
                <StackItem>
                    <IconButton
                        onClick={onDelete}
                        iconProps={{iconName: "ChromeClose"}}
                        title="Close"
                        ariaLabel="Close"
                    />
                </StackItem>
            </Stack>
        </div>
    );
};
