import { createFormeFactory } from '../src/forme/factory';

describe('Test createFormeFactory', () => {
  test('invalid params', () => {
    expect(() => createFormeFactory(1 as any)).toThrow(
      'Plugins must be a array'
    );
  });

  test('update value', () => {
    expect(
      createFormeFactory([
        (state: number) => state + 1,
        (state: number) => state + 1,
        (state: number) => state + 1
      ])(1)
    ).toEqual(4);
  });
});
