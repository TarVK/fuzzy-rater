import {convertNFATemplateToDFATemplate} from "./DFA/convertNFATemplateToDFATemplate";
import {FuzzyWordMatcher} from "./fuzzyRate/FuzzyWordMatcher";

// TODO: currently this file just contains test setups, will be replaced by module exports
let t1 = -Date.now();
const matcher = new FuzzyWordMatcher("something", 2);
t1 += Date.now();

let t2 = -Date.now();
for (let i = 0; i < 1e5; i++) {
    matcher.getMatch("this is really something very cool right?");
}
t2 += Date.now();

let t3 = -Date.now();
for (let i = 0; i < 1e5; i++) {
    matcher.getMatchData("this is really something very cool right?");
}
t3 += Date.now();

console.log(t1, t2, t3);
