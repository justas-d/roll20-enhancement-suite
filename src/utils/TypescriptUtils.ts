export type Optional<T> = T | undefined;

export const exhaustTypeSafe = (a: never): never => {
    throw new Error("BAD: TYPESAFE CASE EXHAUST. tell a programmer");
};
