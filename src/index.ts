import {FuzzyWordMatcher} from "./fuzzyRate/wordMatcher/FuzzyWordMatcher";
import {createFuzzyNFATemplate} from "./fuzzyRate/wordMatcher/createFuzzyNFATemplate";
import {NFA} from "./NFA/NFA";
import {NFADFA} from "./DFA/NFADFA/NFADFA";
import {FuzzyMultiWordMatcher} from "./fuzzyRate/wordMatcher/FuzzyMultiWordMatcher";
import {FuzzyRater} from "./fuzzyRate/FuzzyRater";

// TODO: currently this file just contains test setups, will be replaced by module exports

// =============================================================================
let t1a = -Date.now();
const matcher = new FuzzyWordMatcher("something", 2);
t1a += Date.now();

let t2a = -Date.now();
for (let i = 0; i < 1e5; i++) {
    matcher.getMatch("this is really something very cool right? or somthng");
}
t2a += Date.now();

let t3a = -Date.now();
for (let i = 0; i < 1e5; i++) {
    matcher.getMatchData("this is really something very cool right? or somthng");
}
t3a += Date.now();

// =============================================================================
let t1b = -Date.now();
const multiMatcher = new FuzzyMultiWordMatcher("something", 2);
t1b += Date.now();

let t2b = -Date.now();
for (let i = 0; i < 1e5; i++) {
    multiMatcher.getMatch("this is really something very cool right? or somthng");
}
t2b += Date.now();

let t3b = -Date.now();
for (let i = 0; i < 1e5; i++) {
    multiMatcher.getMatchData("this is really something very cool right? or somthng");
}
t3b += Date.now();

// =============================================================================
let t1c = -Date.now();
const nfaTemplate = createFuzzyNFATemplate("something", 2);
const nfa = new NFA(nfaTemplate);
t1c += Date.now();

let t2c = -Date.now();
for (let i = 0; i < 1e5; i++) {
    nfa.execute("this is really something very cool right? or somthng");
}
t2c += Date.now();

console.log("All executions evaluated 100 000 times\n");
console.log("Evaluating query 'something' with max 2 distance:");
console.log(
    ` matcher setup: ${t1a}, execution: ${t2a}, matchExecution: ${t3a} \n multiMatcher setup: ${t1b}, execution: ${t2b}, matchExecution: ${t3b} \n nfa setup: ${t1c}, execution: ${t2c} \n `
);

// =============================================================================
let t4 = -Date.now();
const fuzzyRater = new FuzzyRater("some cool stuff");
t4 += Date.now();

let t5 = -Date.now();
for (let i = 0; i < 1e5; i++) {
    fuzzyRater.getScore(
        "some things can't be some cool stuff while other stuff can be cool"
    );
}
t5 += Date.now();

let t6 = -Date.now();
for (let i = 0; i < 1e5; i++) {
    fuzzyRater.getScore(
        "nothing here should realistically match the input query since it's too different"
    );
}
t6 += Date.now();

console.log("Evaluating query 'some cool stuff' with max 1 distance per word:");
console.log(
    `Fuzzy rater setup: ${t4}, execution when matching: ${t5}, execution when not matching: ${t6}`
);

// // =============================================================================
// const nfaDfa = new NFADFA(nfaTemplate);

// let t5 = -Date.now();
// for (let i = 0; i < 1e5; i++) {
//     const matches = nfaDfa.executeTraced("this is really something very cool right?");
//     const match = matches.reduce(
//         (best, m) =>
//             m.final.matched && (best == null || m.final.distance < best.final.distance)
//                 ? m
//                 : best,
//         null as null | (typeof matches extends (infer T)[] ? T : never)
//     );
//     const trace = match?.getPath();
// }
// t5 += Date.now();

// console.log(t5);
