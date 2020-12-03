import {IFuzzyWordMatch} from "./wordMatcher/_types/IFuzzyWordMatch";
import {IQueryWord} from "./_types/IQueryWord";
import {IMatchGroup, IMatchGroupRelationData} from "./_types/IMatchGroup";

/**
 * Adds the alteration data to the given collection of match groups
 * @param groups The groups to add the data to
 * @param alterations The alteration data to be added
 * @param queryWord The query word that these alterations are for
 * @returns The groups with the new alterations added
 */
export function addAlterationData(
    groups: IMatchGroup[],
    alterations: IFuzzyWordMatch[],
    queryWord: IQueryWord
): IMatchGroup[] {
    const bestStartIndex =
        queryWord.matchedIndex == -1 ? Infinity : queryWord.matchedIndex;
    let bestGroupFound = false;
    let prevQueryIndex = 0;

    // Deep copy the group data, and track the current one to consider (orGroup)
    groups = groups.map(group => ({
        ...group,
        relations: group.relations.map(relation => ({...relation})),
    }));
    let orGroup = groups.shift();

    const newGroups = [] as IMatchGroup[];
    let newGroup: IMatchGroup | undefined;
    let newRelationData: IMatchGroupRelationData | undefined;
    let prevGroupData = {
        type: "",
        orGroup,
    };
    alterations.forEach(({type, target, query}) => {
        // Keep track of whether the best group was found already, so we don't mark multiple matches as the best
        if (prevQueryIndex > query.index && target.index > bestStartIndex)
            bestGroupFound = true;
        prevQueryIndex = query.index;

        // Find the original group for this text range, with relations to inherit
        while (
            orGroup &&
            (orGroup.range.start == orGroup.range.end
                ? // If the group is an empty group, we should continue if this data contains no empty group
                  orGroup.range.end < target.index + target.character.length
                : // If the group is not empty, we should continue if we reached the end
                  orGroup.range.end <= target.index)
        ) {
            orGroup = groups.shift();
            if (
                orGroup &&
                orGroup.range.start == orGroup.range.end &&
                target.character.length
            ) {
                // Make sure empty groups are still stored
                newGroups.push(orGroup);
            }
        }

        // If the group or match type changed, create a new group
        if (prevGroupData.type != type || prevGroupData.orGroup != orGroup) {
            // Split the original group if needed
            if (orGroup && orGroup.range.start < target.index) {
                const [firstHalf, secondHalf] = splitGroup(orGroup, target.index);
                if (firstHalf) {
                    // Update the relations that were already used
                    orGroup.relations.forEach((relation, i) => {
                        relation.range = firstHalf.relations[i].range;
                    });
                }
                if (secondHalf) orGroup = secondHalf;
            }

            // Create the new relation and group data
            newRelationData =
                type != "ignore"
                    ? {
                          type,
                          range: {
                              start: query.index,
                              end: query.index + query.character.length,
                              text: query.character,
                          },
                          word: queryWord,
                          partOfBestOrder:
                              !bestGroupFound && target.index >= bestStartIndex,
                      }
                    : undefined;
            newGroup = {
                range: {
                    start: target.index,
                    end: target.index + target.character.length,
                    text: target.character,
                },
                relations: newRelationData
                    ? [...(orGroup?.relations ?? []), newRelationData]
                    : orGroup?.relations ?? [],
            };
            prevGroupData = {
                type,
                orGroup,
            };
            newGroups.push(newGroup);
        } else {
            // Update the group data
            if (newRelationData) {
                newRelationData.range.end = query.index + query.character.length;
                newRelationData.range.text += query.character;
            }
            if (newGroup) {
                newGroup.range.end = target.index + target.character.length;
                newGroup.range.text += target.character;
            }
        }
    });

    return newGroups;
}

/**
 * Splits a match group in half, at the given location
 * @param group The group to be split
 * @param index The index to split it at
 * @returns The split group
 */
export function splitGroup(
    group: IMatchGroup,
    index: number
): [IMatchGroup | undefined, IMatchGroup | undefined] {
    if (index < group.range.start) return [undefined, group];
    if (index > group.range.end) return [group, undefined];

    const trim = index - group.range.start;
    const first = {
        range: {
            start: group.range.start,
            end: index,
            text: group.range.text.substring(0, trim),
        },
        relations: group.relations.map(relation => {
            if (relation.type == "match" || relation.type == "replace") {
                const start = relation.range.start;
                return {
                    ...relation,
                    range: {
                        start,
                        end: start + trim,
                        text: relation.range.text.substring(0, trim),
                    },
                };
            }
            return relation;
        }),
    };
    const second = {
        range: {
            start: index,
            end: group.range.end,
            text: group.range.text.substring(trim),
        },
        relations: group.relations.map(relation => {
            if (relation.type == "match" || relation.type == "replace") {
                return {
                    ...relation,
                    range: {
                        start: relation.range.start + trim,
                        end: relation.range.end,
                        text: relation.range.text.substring(trim),
                    },
                };
            }
            return relation;
        }),
    };

    return [first, second];
}
