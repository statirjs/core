import { parsePipe } from '../src/core';

describe('Testing pice of store pipe', () => {
  test('invalid config', () => {
    expect(() =>
      parsePipe(null as any, null as any, null as any, null as any, null as any)
    ).toThrow();
  });

  test('pushAction calling', () => {
    const pushAction = jest.fn(() => undefined);

    const action = parsePipe(
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

    action();

    expect(pushAction.mock.calls.length).toEqual(2);
  });

  test('pushAction params', () => {
    const pushAction = jest.fn(() => undefined);

    const action = parsePipe(
      {
        push(state: any, payload: number): any {
          return {
            ...state,
            count: payload
          };
        }
      },
      {
        hello: {
          count: 0
        }
      },
      pushAction,
      'hello',
      null as any
    );

    action(123);

    const firstCall = (pushAction.mock.calls[0] as any)[0] as any;
    const secondCall = (pushAction.mock.calls[1] as any)[0] as any;

    expect(firstCall.state).toEqual({
      count: 123
    });

    expect(firstCall.payload).toEqual(123);

    expect(firstCall.piceOfStore).toEqual('hello');

    expect(firstCall.action).toEqual('push');

    expect(secondCall.action).toEqual('done');
  });
});
