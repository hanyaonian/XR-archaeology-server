export function getId(item: any, idProperty?: string) {
  idProperty ??= "_id";
  return typeof item === "string" ? item : item?.[idProperty];
}

export function checkId(a: any, b: any): boolean {
  return getId(a) === getId(b);
}
