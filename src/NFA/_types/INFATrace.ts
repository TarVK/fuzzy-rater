/**
 * A trace that can be found in a NFA instance
 */
export type INFATrace<N, T> = {final: N; path: {node: N; transition: T}[]};
