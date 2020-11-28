import {INormalizedNFANode} from "../../NFA/_types/INormalizedNFANode";
import {INormalizedNFATemplate} from "../../NFA/_types/INormalizedNFATemplate";
import {convertNFATemplateToDFATemplate} from "../convertNFATemplateToDFATemplate";
import {IDFANFATemplate} from "../_types/NFAconversion/IDFANFATemplate";

/**
 * Adds the given data to each object in an array
 * @param items The items to add data to
 * @param add The data to add
 * @returns The items with the data added
 */
function add<T extends object, B extends object>(items: T[], add: B): (T & B)[] {
    return items.map(item => ({...item, ...add}));
}

describe("convertNFATemplateToDFATemplate", () => {
    it("Should obtain the proper initial state", () => {
        const nfa: INormalizedNFATemplate<undefined, undefined> = [
            {
                ID: "1",
                initial: true,
                transitions: [
                    {to: "3", type: "empty", metadata: undefined},
                    {to: "4", type: "character", character: "4", metadata: undefined},
                ],
                metadata: undefined,
            },
            {
                ID: "2",
                initial: true,
                transitions: [
                    {to: "3", type: "character", character: "4", metadata: undefined},
                ],
                metadata: undefined,
            },
            {
                ID: "3",
                initial: false,
                transitions: [{to: "5", type: "empty", metadata: undefined}],
                metadata: undefined,
            },
            {
                ID: "4",
                initial: false,
                transitions: [
                    {to: "1", type: "empty", metadata: undefined},
                    {to: "4", type: "character", character: "4", metadata: undefined},
                ],
                metadata: undefined,
            },
            {
                ID: "5",
                initial: false,
                transitions: [],
                metadata: undefined,
            },
        ];
        const dfa = convertNFATemplateToDFATemplate(nfa);

        expect(dfa.initial).toBe("{1,2,3,5}");
    });
    it("Should properly create combined character transitions", () => {
        const a: INormalizedNFANode<undefined, undefined> = {
            ID: "a",
            initial: true,
            transitions: [
                {to: "b", type: "character", character: "a", metadata: undefined},
                {to: "c", type: "character", character: "a", metadata: undefined},
            ],
            metadata: undefined,
        };
        const b: INormalizedNFANode<undefined, undefined> = {
            ID: "b",
            initial: false,
            transitions: [
                {to: "d", type: "character", character: "b", metadata: undefined},
                {to: "e", type: "character", character: "c", metadata: undefined},
            ],
            metadata: undefined,
        };
        const c: INormalizedNFANode<undefined, undefined> = {
            ID: "c",
            initial: false,
            transitions: [
                {to: "f", type: "character", character: "b", metadata: undefined},
                {to: "g", type: "character", character: "d", metadata: undefined},
                {to: "h", type: "remaining", metadata: undefined},
            ],
            metadata: undefined,
        };
        const d: INormalizedNFANode<undefined, undefined> = {
            ID: "d",
            initial: false,
            transitions: [],
            metadata: undefined,
        };
        const e: INormalizedNFANode<undefined, undefined> = {
            ID: "e",
            initial: false,
            transitions: [],
            metadata: undefined,
        };
        const f: INormalizedNFANode<undefined, undefined> = {
            ID: "f",
            initial: false,
            transitions: [],
            metadata: undefined,
        };
        const g: INormalizedNFANode<undefined, undefined> = {
            ID: "g",
            initial: false,
            transitions: [],
            metadata: undefined,
        };
        const h: INormalizedNFANode<undefined, undefined> = {
            ID: "h",
            initial: false,
            transitions: [],
            metadata: undefined,
        };
        const nfa: INormalizedNFATemplate<undefined, undefined> = [
            a,
            b,
            c,
            d,
            e,
            f,
            g,
            h,
        ];

        const dfa = convertNFATemplateToDFATemplate(nfa);

        const dfaTest: IDFANFATemplate<undefined, undefined> = {
            initial: "{a}",
            nodes: [
                {
                    ID: "{a}",
                    transitions: [
                        {
                            to: "{b,c}",
                            type: "character",
                            character: "a",
                            metadata: {sources: add(a.transitions, {from: "a"})},
                        },
                        {
                            to: "{}",
                            type: "remaining",
                            metadata: {sources: []},
                        },
                    ],
                    metadata: {sources: [a]},
                },
                {
                    ID: "{b,c}",
                    transitions: [
                        {
                            to: "{d,f}",
                            type: "character",
                            character: "b",
                            metadata: {
                                sources: [
                                    {...b.transitions[0], from: "b"},
                                    {...c.transitions[0], from: "c"},
                                ],
                            },
                        },
                        {
                            to: "{e,h}",
                            type: "character",
                            character: "c",
                            metadata: {
                                sources: [
                                    {...b.transitions[1], from: "b"},
                                    {...c.transitions[2], from: "c"},
                                ],
                            },
                        },
                        {
                            to: "{g}",
                            type: "character",
                            character: "d",
                            metadata: {sources: [{...c.transitions[1], from: "c"}]},
                        },
                        {
                            to: "{h}",
                            type: "remaining",
                            metadata: {sources: [{...c.transitions[2], from: "c"}]},
                        },
                    ],
                    metadata: {sources: [b, c]},
                },
                {
                    ID: "{d,f}",
                    transitions: [{to: "{}", type: "remaining", metadata: {sources: []}}],
                    metadata: {sources: [d, f]},
                },
                {
                    ID: "{e,h}",
                    transitions: [{to: "{}", type: "remaining", metadata: {sources: []}}],
                    metadata: {sources: [e, h]},
                },
                {
                    ID: "{g}",
                    transitions: [{to: "{}", type: "remaining", metadata: {sources: []}}],
                    metadata: {sources: [g]},
                },
                {
                    ID: "{h}",
                    transitions: [{to: "{}", type: "remaining", metadata: {sources: []}}],
                    metadata: {sources: [h]},
                },
                {
                    ID: "{}",
                    transitions: [{to: "{}", type: "remaining", metadata: {sources: []}}],
                    metadata: {sources: []},
                },
            ],
        };
        expect(dfa.initial).toEqual(dfaTest.initial);
        expect(new Set(dfa.nodes)).toEqual(new Set(dfaTest.nodes));
    });
});
