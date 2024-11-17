export const IsObject = <T extends string>(
  obj: unknown,
  ...arr: T[]
): obj is { [K in T]: unknown } =>
  typeof obj === "object" && obj !== null && arr.every((e) => e in obj)
