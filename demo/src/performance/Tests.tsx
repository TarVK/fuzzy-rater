import React, {FC} from "react";
import {RaterScoreFailureTest} from "./tests/rater/RaterScoreFailureTest";
import {RaterScoreLinearTest} from "./tests/rater/RaterScoreLinearTest";
import {RaterScoreSuccessTest} from "./tests/rater/RaterScoreSuccessTest";
import {RaterMatchDataTest} from "./tests/rater/RaterMatchDataTest";
import {RaterMatchDataLinearTest} from "./tests/rater/RaterMatchDataLinearTest";
import {TestsSection} from "./TestsSection";

/**
 * A bunch of performance tests for the system
 */
export const Tests: FC = () => (
    <>
        <TestsSection
            title="Fuzzy rater"
            description={
                <>
                    The main fuzzy rater class to rate input texts based on word
                    occurrence, typos and word order. <br /> Construction (/compilation)
                    time of the rater increases exponentially with fuzziness and word
                    length, but only linearly with word count. <br /> Execution time only
                    increases linearly with character count and match count.
                </>
            }>
            <RaterScoreSuccessTest />
            <RaterScoreFailureTest />
            <RaterScoreLinearTest />
            <RaterMatchDataTest />
            <RaterMatchDataLinearTest />
        </TestsSection>
    </>
);
