import {INormalizedNFANode} from "../NFA/_types/INormalizedNFANode";
import {INormalizedNFATemplate} from "../NFA/_types/INormalizedNFATemplate";
import {INormalizedNFATransition} from "../NFA/_types/INormalizedNFATransition";
import {IDFANFANode} from "./_types/NFAconversion/IDFANFANode";
import {IDFANFATemplate} from "./_types/NFAconversion/IDFANFATemplate";
import {IDFANFATransition} from "./_types/NFAconversion/IDFANFATransition";

/**
 * Converts the nfa input to a dfa input
 * @param nodes The nodes for a nfa automaton
 * @returns The dfa equivalent automaton template
 */
export function convertNFATemplateToDFATemplate<N, T>(
    nodes: INormalizedNFATemplate<N, T>
): IDFANFATemplate<N, T> {
    const nodeMap = new Map<string, INormalizedNFANode<N, T>>(
        nodes.map(node => [node.ID, node])
    );
    const outMap = new Map<string, IDFANFANode<N, T>>();

    // Get the initial nodes
    const initNodes = getReachableNodes(
        nodeMap,
        nodes.filter(({initial}) => initial)
    );
    const initState = createID(initNodes);

    // Iteratively keep adding nodes and their transitions
    const stack: INormalizedNFANode<N, T>[][] = [initNodes];
    let set: INormalizedNFANode<N, T>[] | undefined;
    while ((set = stack.shift())) {
        const nodes = set;

        // First make sure the node doesn't exist yet
        const ID = createID(nodes);
        if (outMap.has(ID)) continue;

        // Figure out all transitions
        const transitionChars = getAvailableTransitionCharacter(nodes);

        const characterTransitions = transitionChars.map(char => {
            const {transition, to} = getCharacterTransition(nodeMap, nodes, char);
            stack.push(to);
            return transition;
        });

        const {transition: remainingTransition, to} = getRemainingTransition(
            nodeMap,
            nodes
        );
        stack.push(to);

        // Create and store the node
        const node: IDFANFANode<N, T> = {
            ID,
            transitions: [...characterTransitions, remainingTransition],
            metadata: {sources: nodes},
        };
        outMap.set(ID, node);
    }

    // Return the dfa template
    return {nodes: Array.from(outMap.values()), initial: initState};
}

/**
 * Creates a transition, given a character and the node sets to transition from
 * @param template All the nfa input nodes
 * @param nodes The current state
 * @param char The character to transition on
 * @returns The transition for this character
 */
export function getCharacterTransition<N, T>(
    template: Map<string, INormalizedNFANode<N, T>>,
    nodes: INormalizedNFANode<N, T>[],
    char: string
): {transition: IDFANFATransition<T>; to: INormalizedNFANode<N, T>[]} {
    const transitions = [] as INormalizedNFATransition<T>[];

    // Obtain the transitions for each node for this character
    nodes.forEach(node => {
        const charTransitions = node.transitions.filter(
            ({type, character}) => type == "character" && character == char
        );
        if (charTransitions.length > 0) {
            transitions.push(...charTransitions);
        } else {
            const otherTransitions = node.transitions.filter(
                ({type}) => type == "remaining"
            );
            transitions.push(...otherTransitions);
        }
    });

    // Get the ID of the end of the transition
    const toNodesDirect = transitions.map(transition => transition.to);
    const toNodes = getReachableNodes(template, getNodesFromIDs(template, toNodesDirect));
    const to = createID(toNodes);

    // Construct the transition
    return {
        transition: {
            to,
            type: "character",
            character: char,
            metadata: {sources: transitions},
        },
        to: toNodes,
    };
}

/**
 * Retrieves the transition for all characters for which no specific transition exists
 * @param template All the nfa input nodes
 * @param nodes The current state
 * @returns The transition for the remaining characters
 */
export function getRemainingTransition<N, T>(
    template: Map<string, INormalizedNFANode<N, T>>,
    nodes: INormalizedNFANode<N, T>[]
): {transition: IDFANFATransition<T>; to: INormalizedNFANode<N, T>[]} {
    const transitions = [] as INormalizedNFATransition<T>[];

    // Obtain the transitions for each node for this character
    nodes.forEach(node => {
        const remainingTransitions = node.transitions.filter(
            ({type}) => type == "remaining"
        );
        transitions.push(...remainingTransitions);
    });

    // Get the ID of the end of the transition
    const toNodesDirect = transitions.map(transition => transition.to);
    const toNodes = getReachableNodes(template, getNodesFromIDs(template, toNodesDirect));
    const to = createID(toNodes);

    // Construct the transition
    return {
        transition: {
            to,
            type: "remaining",
            metadata: {sources: transitions},
        },
        to: toNodes,
    };
}

/**
 * Retrieves the transition characters found in the given set of nodes
 * @param nodes The nodes in which to look for transition characters
 * @returns The transition character set
 */
export function getAvailableTransitionCharacter<N, T>(
    nodes: INormalizedNFANode<N, T>[]
): string[] {
    return Array.from(
        new Set(
            nodes
                .flatMap(({transitions}) => transitions)
                .filter(({type}) => type == "character")
                .map(({character}) => character)
                .filter((char): char is string => !!char)
        )
    );
}

/**
 * Checks what nodes are reachable with the given set, by using empty transitions
 * @param template All the nfa input nodes
 * @param nodes The nodes to get the closure of
 * @returns The reach of these nodes
 */
export function getReachableNodes<N, T>(
    template: Map<string, INormalizedNFANode<N, T>>,
    nodes: INormalizedNFANode<N, T>[]
): INormalizedNFANode<N, T>[] {
    const reachableNodes = new Set(nodes);
    for (let node of reachableNodes) {
        const emptyTransitions = node.transitions.filter(({type}) => type == "empty");
        const transitionNodes = getNodesFromIDs(
            template,
            emptyTransitions.map(({to}) => to)
        );
        transitionNodes.forEach(node => reachableNodes.add(node));
    }
    return Array.from(reachableNodes);
}

/**
 * Creates an ID to uniquely define a set of nodes, no matter what the order is
 * @param nodes The nodes to create the ID for
 * @returns The created ID
 */
export function createID<N, T>(nodes: (INormalizedNFANode<N, T> | string)[]): string {
    const IDs = nodes.map(node => (typeof node == "string" ? node : node.ID));
    const sorted = IDs.sort();
    return `{${sorted.join(",")}}`;
}

/**
 * Retrieves nodes given the list of IDs
 * @param map The map of items that the nodes are in
 * @param IDs The IDs of the nodes to retrieve
 * @returns The nodes
 */
export function getNodesFromIDs<T>(map: Map<string, T>, IDs: string[]): T[] {
    return IDs.map(ID => map.get(ID)).filter((n): n is T => !!n);
}
