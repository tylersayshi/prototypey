//#region src/type-utils.d.ts
/**
 * Converts a string union type to a tuple type
 * @example
 * type Colors = "red" | "green" | "blue";
 * type ColorTuple = UnionToTuple<Colors>; // ["red", "green", "blue"]
 */
type UnionToTuple<T> = ((T extends unknown ? (x: () => T) => void : never) extends ((x: infer I) => void) ? I : never) extends (() => infer R) ? [...UnionToTuple<Exclude<T, R>>, R] : [];
type Prettify<T> = { [K in keyof T]: T[K] } & {};
//# sourceMappingURL=type-utils.d.ts.map

//#endregion
export { Prettify, UnionToTuple };
//# sourceMappingURL=type-utils.d.ts.map