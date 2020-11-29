export type IDFATrace<N, T> = {
    final: N;
    path: {fromNode: N; transition: T}[];
};
