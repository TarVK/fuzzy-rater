import {convertNFATemplateToDFATemplate} from "./DFA/convertNFATemplateToDFATemplate";
import {DFA} from "./DFA/DFA";
import {createFuzzyNFATemplate} from "./fuzzyRate/createFuzzyNFATemplate";

// TODO: currently this file just contains test setups, will be replaced by module exports
const s = Date.now();
const nfaTemplate = createFuzzyNFATemplate("something", 2);
const dfaTemplate = convertNFATemplateToDFATemplate(nfaTemplate);
const dfa = new DFA(dfaTemplate);
const e = Date.now() - s;

const s2 = Date.now();
for (let i = 0; i < 1e5; i++) {
    dfa.executeTraced("this is really something very cool right?");
}
const e2 = Date.now() - s2;

console.log(e, dfaTemplate.nodes.length, e2);
