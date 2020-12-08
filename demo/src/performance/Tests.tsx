import React, {FC} from "react";
import {TestsSection} from "./TestsSection";
import {RaterScoreFailureTest} from "./tests/rater/RaterScoreFailureTest";
import {RaterScoreLinearTest} from "./tests/rater/RaterScoreLinearTest";
import {RaterScoreSuccessTest} from "./tests/rater/RaterScoreSuccessTest";
import {RaterMatchDataTest} from "./tests/rater/RaterMatchDataTest";
import {RaterMatchDataLinearTest} from "./tests/rater/RaterMatchDataLinearTest";
import {MatcherScoreSuccessTest} from "./tests/wordMatcher/MatcherScoreSuccessTest";
import {MatcherScoreFailureTest} from "./tests/wordMatcher/MatcherScoreFailureTest";
import {MatcherMatchDataTest} from "./tests/wordMatcher/MatcherMatchDataTest";
import {MultiMatcherScoreSuccessTest} from "./tests/multiWordMatcher/MultiMatcherScoreSuccessTest";
import {MultiMatcherScoreFailureTest} from "./tests/multiWordMatcher/MultiMatcherScoreFailureTest";
import {MultiMatcherMatchDataTest} from "./tests/multiWordMatcher/MultiMatcherMatchDataTest";
import {MultiMatcherScoreLinearTest} from "./tests/multiWordMatcher/MultiMatcherScoreLinearTest";
import {MultiMatcherMatchDataLinearTest} from "./tests/multiWordMatcher/MultiMatcherMatchDataLinearTest";
import {OrderMatcherScoreSuccessTest} from "./tests/orderMatcher/OrderMatcherScoreSuccessTest";
import {OrderMatcherMatchDataTest} from "./tests/orderMatcher/OrderMatcherMatchDataTest";

/**
 * A bunch of performance tests for the system
 */
export const Tests: FC = () => (
    <>
        <TestsSection
            title="Fuzzy rater"
            description={
                <>
                    The main fuzzy rater class can be used to rate input texts based on
                    word occurrence, typos and word order. <br /> Construction
                    (/compilation) time of the rater increases exponentially with
                    fuzziness and word length, but only linearly with word count. <br />
                    Execution time only increases linearly with character count and match
                    count.
                </>
            }>
            <RaterScoreSuccessTest />
            <RaterScoreFailureTest />
            <RaterScoreLinearTest />
            <RaterMatchDataTest />
            <RaterMatchDataLinearTest />
        </TestsSection>
        <TestsSection
            title="Word matcher"
            description={
                <>
                    The word matcher class can be used to find whether the given text
                    contains the word, and with how many typos. This doesn't check whether
                    multiple occurrences exist, it only tries to find the best one. <br />
                    Construction (/compilation) time of the matcher increases
                    exponentially with max similarity distance and word length. <br />
                    Execution time only increases linearly with character count.
                </>
            }>
            <MatcherScoreSuccessTest />
            <MatcherScoreFailureTest />
            <MatcherMatchDataTest />
        </TestsSection>
        <TestsSection
            title="Multi word matcher"
            description={
                <>
                    The word matcher class can be used to find whether the given text
                    contains the word, how often it does, and with how many typos. <br />
                    Construction (/compilation) time of the matcher increases
                    exponentially with max similarity distance and word length. <br />
                    Execution time only increases linearly with character count.
                </>
            }>
            <MultiMatcherScoreSuccessTest />
            <MultiMatcherScoreFailureTest />
            <MultiMatcherScoreLinearTest />
            <MultiMatcherMatchDataTest />
            <MultiMatcherMatchDataLinearTest />
        </TestsSection>
        <TestsSection
            title="Word order matcher"
            description={
                <>
                    The word order matcher class can be used to find the best selection of
                    words to minimize swaps and distance between them. <br /> Construction
                    (/compilation) time of the matcher increases only linearly with number
                    of words, and construction time is generally negligible. <br />
                    Execution time only increases linearly with match and query word
                    count.
                </>
            }>
            <OrderMatcherScoreSuccessTest />
            <OrderMatcherMatchDataTest />
        </TestsSection>
    </>
);
