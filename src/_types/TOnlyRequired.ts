export type TNonUndefinedPropertyNames<T> = {
    [K in keyof T]: T[K] extends undefined ? never : K;
}[keyof T];

/** A transformation type that removes any fields with type undefined */
export type TOnlyRequired<T> = Pick<T, TNonUndefinedPropertyNames<T>>;
