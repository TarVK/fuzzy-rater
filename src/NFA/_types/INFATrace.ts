/**
 * A trace that can be found in a NFA instance
 */
export type INFATrace<N, T> = {final: N; path: {fromNode: N; transition: T}[]};
