import {mergeStyleSets} from "@fluentui/react";
import React, {FC} from "react";

const classNames = mergeStyleSets({
    grid: {
        display: "flex",
        flexWrap: "wrap",
        selectors: {
            "&>*": {
                flex: "1 1 600px",
            },
        },
    },
});

/**
 * A grid specifically for the tests
 */
export const TestGrid: FC = ({children}) => (
    <div className={classNames.grid}>{children}</div>
);
