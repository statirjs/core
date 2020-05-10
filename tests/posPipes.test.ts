import { parsePipes } from '../src/core';

describe('Testing pice of store pipes', () => {
  test('null pipes', () => {
    expect(() =>
      parsePipes(null as any, null as any, null as any, null as any)
    ).toThrow();
  });

  test('invalid pipes', () => {
    expect(() =>
      parsePipes({}, null as any, null as any, null as any)
    ).not.toThrow();

    expect(() =>
      parsePipes(23 as any, null as any, null as any, null as any)
    ).toThrow();

    expect(parsePipes({}, null as any, null as any, null as any)).toEqual({});
  });

  test('invalid pipe', () => {
    expect(() =>
      parsePipes(
        {
          testPipe: null
        } as any,
        null as any,
        null as any,
        null as any
      )
    ).toThrow();
  });

  test('pipe return value', () => {
    expect(
      parsePipes(
        {
          testPipe: {
            push(state: any, payload: number) {
              return {
                ...state,
                count: payload
              };
            }
          }
        } as any,
        {
          testPipe: {
            count: 0
          }
        },
        () => {},
        'testPipe'
      )['testPipe'](1)
    ).toBe(undefined);
  });
});
