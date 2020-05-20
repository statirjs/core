import { parsePipe } from '../src/forme/creator';

describe('Test parsePipe', () => {
  test('invalid value', () => {
    expect(() =>
      parsePipe(null as any, null as any, null as any, null as any, null as any)
    ).toThrow();
  });

  test('return value', async () => {
    const parsedPipe = parsePipe(
      {
        push(state: any) {
          return state;
        }
      },
      {
        testForme: {
          test: 1
        }
      },
      () => {},
      'testForme',
      'testAction'
    );

    expect(await parsedPipe()).toBeUndefined();
  });

  test('update calls', async () => {
    const updateState = jest.fn(() => {});

    const parsedPipe = parsePipe(
      {
        push(state: any) {
          return state;
        }
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

    await parsedPipe();

    const mock = updateState.mock.calls as any;

    expect(mock.length).toEqual(2);

    expect(mock[0][0].state).toEqual({ test: 1 });

    expect(mock[0][0].formeName).toEqual('testForme');

    expect(mock[0][0].actionName).toEqual('testAction:push');

    expect(mock[0][0].rootState).toEqual({
      testForme: {
        test: 1
      }
    });

    expect(mock[1][0].actionName).toEqual('testAction:done');

    await parsedPipe();

    expect(updateState.mock.calls.length).toEqual(4);
  });

  test('rootState save', async () => {
    const updateState = jest.fn(() => {});

    const parsedPipe = parsePipe(
      {
        push(state: any, payload: number) {
          return {
            ...state,
            test: state.test + payload
          };
        }
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

    await parsedPipe(1);

    const mock = updateState.mock.calls as any;

    expect(mock[0][0].state).toEqual({ test: 2 });

    expect(mock[1][0].state).toEqual({ test: 2 });

    await parsedPipe(2);

    expect(mock[2][0].state).toEqual({ test: 3 });

    expect(mock[3][0].state).toEqual({ test: 3 });
  });

  test('done pipe', async () => {
    const push = jest.fn((state: any, payload: number) => {
      return {
        ...state,
        test: state.test + payload
      };
    });

    const core = jest.fn((state: any, payload: number) => {
      return 1 + payload;
    });

    const done = jest.fn((state: any) => {
      return state;
    });

    const fail = jest.fn((state: any) => {
      return state;
    });

    const parsedPipe = parsePipe(
      {
        push,
        core,
        done,
        fail
      },
      {
        testForme: {
          test: 1
        }
      },
      () => {},
      'testForme',
      'testAction'
    );

    await parsedPipe(0);

    const pushMock = push.mock.calls as any;

    const coreMock = core.mock.calls as any;

    const doneMock = done.mock.calls as any;

    const failMock = fail.mock.calls as any;

    expect(pushMock.length).toEqual(1);

    expect(coreMock.length).toEqual(1);

    expect(doneMock.length).toEqual(1);

    expect(failMock.length).toEqual(0);

    expect(pushMock[0][0]).toEqual({ test: 1 });

    expect(coreMock[0][0]).toEqual({ test: 1 });

    expect(doneMock[0][0]).toEqual({ test: 1 });

    expect(doneMock[0][2]).toEqual(1);

    await parsedPipe(1);

    expect(pushMock.length).toEqual(2);

    expect(coreMock.length).toEqual(2);

    expect(doneMock.length).toEqual(2);

    expect(failMock.length).toEqual(0);

    expect(pushMock[1][0]).toEqual({ test: 1 });

    expect(coreMock[1][0]).toEqual({ test: 2 });

    expect(doneMock[1][0]).toEqual({ test: 2 });

    expect(doneMock[1][2]).toEqual(2);
  });

  test('fail pipe', async () => {
    const push = jest.fn((state: any, payload: number) => {
      return {
        ...state,
        test: state.test + payload
      };
    });

    const core = jest.fn(() => {
      throw new Error('test error');
    });

    const done = jest.fn((state: any) => {
      return state;
    });

    const fail = jest.fn((state: any) => {
      return state;
    });

    const parsedPipe = parsePipe(
      {
        push,
        core,
        done,
        fail
      },
      {
        testForme: {
          test: 1
        }
      },
      () => {},
      'testForme',
      'testAction'
    );

    await parsedPipe(0);

    const pushMock = push.mock.calls as any;

    const coreMock = core.mock.calls as any;

    const doneMock = done.mock.calls as any;

    const failMock = fail.mock.calls as any;

    expect(pushMock.length).toEqual(1);

    expect(coreMock.length).toEqual(1);

    expect(doneMock.length).toEqual(0);

    expect(failMock.length).toEqual(1);

    expect(pushMock[0][0]).toEqual({ test: 1 });

    expect(coreMock[0][0]).toEqual({ test: 1 });

    expect(failMock[0][0]).toEqual({ test: 1 });

    expect(failMock[0][2]).toEqual(new Error('test error'));

    await parsedPipe(1);

    expect(pushMock.length).toEqual(2);

    expect(coreMock.length).toEqual(2);

    expect(doneMock.length).toEqual(0);

    expect(failMock.length).toEqual(2);

    expect(pushMock[1][0]).toEqual({ test: 1 });

    expect(coreMock[1][0]).toEqual({ test: 2 });

    expect(failMock[1][0]).toEqual({ test: 2 });

    expect(failMock[1][1]).toEqual(1);

    expect(() => parsedPipe(0)).not.toThrow();
  });
});
