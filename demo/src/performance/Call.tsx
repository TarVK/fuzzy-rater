import {getTheme} from "@fluentui/react";
import React, {FC} from "react";

const theme = getTheme();
export const Call: FC = ({children}) => (
    <code style={{color: theme.palette.themePrimary}}>{children}</code>
);
