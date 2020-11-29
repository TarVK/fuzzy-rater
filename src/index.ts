import {FuzzyWordMatcher} from "./fuzzyRate/FuzzyWordMatcher";
import {createFuzzyNFATemplate} from "./fuzzyRate/createFuzzyNFATemplate";
import {NFA} from "./NFA/NFA";
import {NFADFA} from "./DFA/NFADFA/NFADFA";
import {FuzzyMultiWordMatcher} from "./fuzzyRate/FuzzyMultiWordMatcher";

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

console.log(
    `matcher setup: ${t1a}, execution: ${t2a}, matchExecution: ${t3a} \nmultiMatcher setup: ${t1b}, execution: ${t2b} \nnfa setup: ${t1c}, execution: ${t2c} \n `
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

// console.log(t1, t2, t3, t4, t5);
