import { parseAction } from '../src/forme/creator';

describe('Test parseAction', () => {
  test('invalid value', () => {
    expect(() =>
      parseAction(
        null as any,
        null as any,
        null as any,
        null as any,
        null as any
      )
    ).not.toThrow();
  });

  test('return value', () => {
    const parsedAction = parseAction(
      (state: any) => state,
      {
        testForme: {
          test: 1
        }
      },
      () => {},
      'testForme',
      'testAction'
    );

    expect(parsedAction()).toBeUndefined();
  });

  test('update calls', () => {
    const updateState = jest.fn(() => {});

    const parsedAction = parseAction(
      (state: any) => state,
      {
        testForme: {
          test: 1
        }
      },
      updateState,
      'testForme',
      'testAction'
    );

    parsedAction();

    const mock = updateState.mock.calls as any;

    expect(mock.length).toEqual(1);

    expect(mock[0][0].state).toEqual({ test: 1 });

    expect(mock[0][0].formeName).toEqual('testForme');

    expect(mock[0][0].actionName).toEqual('testAction');

    expect(mock[0][0].rootState).toEqual({
      testForme: {
        test: 1
      }
    });
  });

  test('rootState save', () => {
    const updateState = jest.fn(() => {});

    const parsedAction = parseAction(
      (state: any, payload: number) => {
        return {
          ...state,
          test: state.test + payload
        };
      },
      {
        testForme: {
          test: 1
        }
      },
      updateState,
      'testForme',
      'testAction'
    );

    parsedAction(1);

    const mock = updateState.mock.calls as any;

    expect(mock[0][0].state).toEqual({ test: 2 });

    parsedAction(2);

    expect(mock[1][0].state).toEqual({ test: 3 });
  });
});
