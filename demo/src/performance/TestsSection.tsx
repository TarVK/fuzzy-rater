import {getTheme, Separator} from "@fluentui/react";
import React, {FC, ReactNode} from "react";
import {TestGrid} from "./TestGrid";

const theme = getTheme();
/**
 * Styling for a section of tests
 */
export const TestsSection: FC<{title: string; description: ReactNode}> = ({
    title,
    description,
    children,
}) => (
    <>
        <h2
            style={{...(theme.fonts.xxLarge as any), margin: 0}}
            id={title.replace(/\s(.)/g, (m, g1) => g1.toUpperCase())}>
            {title}
        </h2>
        <Separator />
        {description}
        <br />
        <br />
        <TestGrid>{children}</TestGrid>
    </>
);
