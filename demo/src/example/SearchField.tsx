import React, {FC, Fragment, useCallback} from "react";
import {TextField} from "@fluentui/react";
import Color from "color";

const font = `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif`;

/**
 * A simple search field that also highlights the different search terms
 */
export const SearchField: FC<{
    value: string;
    onChange: (value: string) => void;
    getColor: (index: number) => string;
}> = ({value, onChange, getColor}) => {
    const changeListener = useCallback((e: any, value: string) => onChange(value), [
        onChange,
    ]);
    const colored = value.split(" ").map((word, i) => {
        const color = getColor(i);
        return (
            <Fragment key={i}>
                <span
                    style={{
                        backgroundColor: color,
                        color: new Color(color).isDark() ? "#FFF" : "#000",
                    }}>
                    {word}
                </span>{" "}
            </Fragment>
        );
    });

    // Use some hacky stuff to kind of color highlight the input text
    return (
        <div style={{position: "relative"}}>
            <TextField value={value} onChange={changeListener} />
            <div
                style={{
                    position: "absolute",
                    top: 7,
                    left: 9,
                    fontFamily: font,
                    fontSize: 14,
                    fontWeight: 400,
                }}>
                {colored}
            </div>
        </div>
    );
};
