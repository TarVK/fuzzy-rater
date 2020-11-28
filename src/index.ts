import {FuzzyWordMatcher} from "./fuzzyRate/FuzzyWordMatcher";
import {createFuzzyNFATemplate} from "./fuzzyRate/createFuzzyNFATemplate";
import {NFA} from "./NFA/NFA";
import {NFADFA} from "./DFA/NFADFA/NFADFA";

// TODO: currently this file just contains test setups, will be replaced by module exports

// =============================================================================
let t1 = -Date.now();
const matcher = new FuzzyWordMatcher("something", 2);
t1 += Date.now();

// =============================================================================
let t2 = -Date.now();
for (let i = 0; i < 1e5; i++) {
    matcher.getMatch("this is really something very cool right?");
}
t2 += Date.now();

// =============================================================================
let t3 = -Date.now();
for (let i = 0; i < 1e5; i++) {
    matcher.getMatchData("this is really something very cool right?");
}
t3 += Date.now();

// =============================================================================
const nfaTemplate = createFuzzyNFATemplate("something", 2);
const nfa = new NFA(nfaTemplate);

let t4 = -Date.now();
for (let i = 0; i < 1e5; i++) {
    nfa.execute("this is really something very cool right?");
}
t4 += Date.now();

// =============================================================================
const nfaDfa = new NFADFA(nfaTemplate);

let t5 = -Date.now();
for (let i = 0; i < 1e5; i++) {
    const matches = nfaDfa.executeTraced("this is really something very cool right?");
    const match = matches.reduce(
        (best, m) =>
            m.final.matched && (best == null || m.final.distance < best.final.distance)
                ? m
                : best,
        null as null | (typeof matches extends (infer T)[] ? T : never)
    );
    const trace = match?.getPath();
}
t5 += Date.now();

console.log(t1, t2, t3, t4, t5);
