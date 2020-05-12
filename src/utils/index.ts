export type IWarning = [boolean, string];

export function warning(warnings: IWarning[]): void {
  warnings.forEach(([isThrow, message]) => {
    if (isThrow) {
      throw new Error(message);
    }
  });
}
