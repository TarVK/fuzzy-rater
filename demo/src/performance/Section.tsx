import {getTheme, Icon, Separator} from "@fluentui/react";
import React, {FC, useState} from "react";

const theme = getTheme();
export const Section: FC<{
    title: string;
    id?: string;
    collapsible?: boolean;
    initExpanded?: boolean;
    subSection?: boolean;
}> = ({children, title, collapsible, subSection, initExpanded = true, id}) => {
    const [expanded, setExpanded] = useState(initExpanded);
    const Header = subSection ? "h3" : "h4";
    const headerStyle = subSection
        ? {...theme.fonts.large, margin: 0}
        : {...theme.fonts.xLarge, margin: 0, marginBottom: 5};
    return (
        <div style={{padding: 5}}>
            {collapsible ? (
                <Header
                    style={{
                        ...(headerStyle as any),
                        cursor: "pointer",
                    }}
                    id={id}
                    onClick={() => setExpanded(t => !t)}>
                    <Icon
                        styles={{
                            root: {
                                fontSize: 20,
                                verticalAlign: "bottom",
                                marginRight: 10,
                            },
                        }}
                        iconName={expanded ? "ChevronDown" : "ChevronRight"}
                    />
                    {title}
                </Header>
            ) : (
                <Header style={headerStyle as any} id={id}>
                    {title}
                </Header>
            )}
            <Separator />
            {expanded && <>{children}</>}
        </div>
    );
};
