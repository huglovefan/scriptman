// https://github.com/Microsoft/TypeScript/issues/17002
export const isReadonlyArray = <(x: any) => x is ReadonlyArray<any>> Array.isArray;