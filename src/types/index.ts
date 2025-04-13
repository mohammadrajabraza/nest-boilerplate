export type Constructor<T = any, Arguments extends unknown[] = any[]> = new (
  ...arguments_: Arguments
) => T;

export type KeyOfType<Entity, U> = {
  [P in keyof Required<Entity>]: Required<Entity>[P] extends U
    ? P
    : Required<Entity>[P] extends U[]
      ? P
      : never;
}[keyof Entity];

export type Reference<T> = T;

export type NestedKeyOf<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ?
            | NestedKeyOf<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>
            | (Prefix extends '' ? K : `${Prefix}.${K}`)
        : Prefix extends ''
          ? K
          : `${Prefix}.${K}`;
    }[keyof T & string]
  : never;

export type Uuid = string & { _uuidBrand: undefined };
