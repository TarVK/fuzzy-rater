import {INormalizedNFANode} from "../NFA/_types/INormalizedNFANode";
import {INormalizedNFATemplate} from "../NFA/_types/INormalizedNFATemplate";
import {INormalizedNFATransition} from "../NFA/_types/INormalizedNFATransition";
import {IFuzzyNodeData} from "./_types/IFuzzyNodeData";
import {IFuzzyTransitionData} from "./_types/IFuzzyTransitionData";

/**
 * Creates a new dfa template based on the query and max distance
 * @param query The query to create a template for
 * @param maxDistance The maximal allowed distance
 * @returns A dfa template
 */
export function createFuzzyNFATemplate(
    query: string,
    maxDistance: number
): INormalizedNFATemplate<IFuzzyNodeData, IFuzzyTransitionData> {
    const nodes = [] as INormalizedNFANode<IFuzzyNodeData, IFuzzyTransitionData>[];

    // Add the initial node
    nodes.push({
        ID: getID(query, 0, -1),
        initial: true,
        transitions: [...getTransitions(query, maxDistance, 0, -1)],
        metadata: {
            matched: false,
            distance: 0,
        },
    });

    // Compute the grid of nodes
    for (let dist = 0; dist <= maxDistance; dist++) {
        for (let i = 0; i < query.length; i++) {
            nodes.push({
                ID: getID(query, dist, i),
                initial: false,
                transitions: [...getTransitions(query, maxDistance, dist, i)],
                metadata: {
                    matched: i + 1 == query.length,
                    distance: dist,
                },
            });
        }
    }

    return nodes;
}

/**
 * Retrieves all the transitions for a given node
 * @param query The query the transitions are for
 * @param maxDist The maximal allowed distance
 * @param dist The current distance
 * @param index The index of character matched so far
 * @returns The set of transitions from this node
 */
export function getTransitions(
    query: string,
    maxDist: number,
    dist: number,
    index: number
): INormalizedNFATransition<IFuzzyTransitionData>[] {
    const nextIndex = index + 1;
    const nextChar = query[nextIndex];

    const transitions: INormalizedNFATransition<IFuzzyTransitionData>[] = [];
    if (nextChar) {
        // Literal character match
        transitions.push({
            to: getID(query, dist, nextIndex),
            type: "character",
            character: nextChar,
            metadata: {
                type: "match",
                character: nextChar,
            },
        });

        if (dist < maxDist) {
            // Skip query character
            transitions.push({
                to: getID(query, dist + 1, nextIndex),
                type: "empty",
                metadata: {
                    type: "skip",
                    character: nextChar,
                },
            });

            // Replace query character
            transitions.push({
                to: getID(query, dist + 1, nextIndex),
                type: "remaining",
                metadata: {
                    type: "replace",
                    character: nextChar,
                },
            });
        }
    }

    if (dist < maxDist && -1 < index && index < query.length - 1) {
        // Insert random character in the query
        transitions.push({
            to: getID(query, dist + 1, index),
            type: "remaining",
            metadata: {type: "insert"},
        });
    }

    if (index == -1) {
        // Match any number of characters before query (including the first character itself)
        transitions.push({
            to: getID(query, dist, index),
            type: "remaining",
            metadata: {type: "ignore"},
        });
        transitions.push({
            to: getID(query, dist, index),
            type: "character",
            character: nextChar,
            metadata: {type: "ignore"},
        });
    }

    if (nextIndex == query.length) {
        // Match any number of characters after query
        transitions.push({
            to: getID(query, dist, index),
            type: "remaining",
            metadata: {type: "ignore"},
        });
    }

    return transitions;
}

/**
 * Retrieves the ID for a node with the given data
 * @param query The query the node is for
 * @param dist The correctness distance the node is for
 * @param index The character index matched by the node
 * @returns THe ID for the node
 */
export function getID(query: string, dist: number, index: number): string {
    return index == -1
        ? `start:${dist}`
        : `${index}:${query.substring(0, index + 1)}-${dist}`;
    // return `${index}:${dist}`;
}
