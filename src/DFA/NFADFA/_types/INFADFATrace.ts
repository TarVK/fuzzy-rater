/**
 * A trace that can be found in a NFA DFA instance
 */
export type INFADFATrace<N, T> = {final: N; getPath(): {node: N; transition: T}[]};
