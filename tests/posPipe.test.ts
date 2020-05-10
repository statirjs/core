import { parsePipe } from '../src/core';
// import { IAction } from '../src/types';

describe('Testing pice of store pipe', () => {
  test('invalid config', () => {
    expect(() =>
      parsePipe(null as any, null as any, null as any, null as any, null as any)
    ).toThrow();
  });

  test('calling pushAction', () => {
    const pushAction = jest.fn(() => undefined);
    parsePipe(
      {
        push(state: any) {
          return state;
        }
      },
      {
        hello: {
          count: 0
        }
      },
      pushAction,
      null as any,
      null as any
    );
  });
});
