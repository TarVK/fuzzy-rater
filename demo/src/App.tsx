import React, {FC} from "react";
import {SearchDemo} from "./example/SearchDemo";
import {
    getTheme,
    INavLink,
    INavLinkGroup,
    initializeIcons,
    Nav,
    Stack,
    StackItem,
} from "@fluentui/react";
import {Tests} from "./performance/Tests";

initializeIcons();
const theme = getTheme();
export const App: FC = ({}) => {
    const onClick = (
        ev?: React.MouseEvent<HTMLElement, MouseEvent> | undefined,
        item?: INavLink | undefined
    ) => {};
    return (
        <Stack
            horizontal
            styles={{root: {...(theme.fonts.medium as any), flexWrap: "wrap"}}}>
            <StackItem
                align="start"
                styles={{
                    root: {
                        width: 250,
                        padding: 20,
                        position: "sticky",
                        top: 0,
                        boxShadow: theme.effects.elevation16,
                        height: "calc(100vh - 2*20px)",
                    },
                }}>
                <Nav
                    onLinkClick={onClick}
                    selectedKey="key3"
                    ariaLabel="Nav basic example"
                    groups={menu}
                />
            </StackItem>
            <StackItem grow styles={{root: {flexBasis: 500}}}>
                <Stack
                    styles={{
                        root: {background: theme.palette.neutralLighterAlt, padding: 10},
                    }}>
                    <StackItem grow align="center" styles={{root: {maxWidth: 1300}}}>
                        <h1 style={theme.fonts.xxLargePlus as any} id="fuzzyRater">
                            Fuzzy rater
                        </h1>
                        Fuzzy-rater is a library that contains extensible components that
                        can be used to construct a fuzzy search system. It's not meant as
                        a plug and play library like most search libraries are, but
                        instead as a foundation to build your own customized search on top
                        of.
                        <h1 style={theme.fonts.xxLargePlus as any} id="demo">
                            Demo
                        </h1>
                        <SearchDemo />
                        <div style={{height: 100}} />
                        <h1
                            style={{...(theme.fonts.xxLargePlus as any), marginBottom: 0}}
                            id="tests">
                            Performance tests
                        </h1>
                        Below is a collection of runnable tests which I have run on my
                        3.2Ghz Ryzen 5 1600 Six-Core Processor, such that you can see the
                        performance on a mid-range processor as well as your own.
                        <div style={{height: 30}} />
                        <Tests />
                    </StackItem>
                </Stack>
            </StackItem>
        </Stack>
    );
};

const menu: INavLinkGroup[] = [
    {
        links: [
            {
                name: "Fuzzy Rater",
                url: "#fuzzyRater",
                key: "fuzzyRater",
            },
            {
                name: "Demo",
                url: "#demo",
                key: "demo",
            },
            {
                name: "Performance Tests",
                url: "#tests",
                key: "tests",
                isExpanded: true,
                links: [
                    {
                        name: "Fuzzy-rater",
                        url: "#FuzzyRater",
                        key: "fuzzyRater",
                        isExpanded: true,
                        links: [
                            {
                                key: "raterMatchesScore",
                                name: "Matches score",
                                url: "#RaterMatchesScore",
                            },
                            {
                                key: "raterNoMatchesScore",
                                name: "No matches score",
                                url: "#RaterNoMatchesScore",
                            },
                            {
                                key: "linearTime",
                                name: "Linear time score",
                                url: "#RaterLinearTimeScore",
                            },
                            {
                                key: "raterMatchData",
                                name: "Match data",
                                url: "#RaterMatchData",
                            },
                            {
                                key: "linearTimeData",
                                name: "Linear time match data",
                                url: "#RaterLinearTimeMatchData",
                            },
                        ],
                    },
                    {
                        name: "Word matcher",
                        url: "#WordMatcher",
                        key: "WordMatcher",
                        links: [
                            {
                                key: "matcherMatchesScore",
                                name: "Matches score",
                                url: "#WordMatcherMatchesScore",
                            },
                            {
                                key: "matcherNoMatchesScore",
                                name: "No matches score",
                                url: "#WordMatcherNoMatchesScore",
                            },
                            {
                                key: "matcherMatchData",
                                name: "Match data",
                                url: "#WordMatcherMatchData",
                            },
                        ],
                    },
                    {
                        name: "Multi word matcher",
                        url: "#MultiWordMatcher",
                        key: "MultiWordMatcher",
                        links: [
                            {
                                key: "multiMatcherMatchesScore",
                                name: "Matches score",
                                url: "#MultiWordMatcherMatchesScore",
                            },
                            {
                                key: "multiMatcherNoMatchesScore",
                                name: "No matches score",
                                url: "#MultiWordMatcherNoMatchesScore",
                            },
                            {
                                key: "matcherLinearTime",
                                name: "Linear time score",
                                url: "#MultiWordMatcherLinearTimeScore",
                            },
                            {
                                key: "multiMatcherMatchData",
                                name: "Match data",
                                url: "#MultiWordMatcherMatchData",
                            },
                            {
                                key: "matcherLinearTimeData",
                                name: "Linear time match data",
                                url: "#MultiWordMatcherLinearTimeMatchData",
                            },
                        ],
                    },
                    {
                        name: "Word order matcher",
                        url: "#WordOrderMatcher",
                        key: "WordOrderMatcher",
                        links: [
                            {
                                key: "wordOrderMatchesScore",
                                name: "Matches score",
                                url: "#OrderMatcherMatchesScore",
                            },
                            {
                                key: "wordOrderMatchData",
                                name: "Match data",
                                url: "#OrderMatcherMatchData",
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
