import { createReduxDevtoolsMiddleware } from '../src/upgrades/devtool';

describe('Test createReduxDevtoolsMiddleware', () => {
  test('invalid params', () => {
    expect(() => createReduxDevtoolsMiddleware(null as any)).not.toThrow();

    expect(() =>
      createReduxDevtoolsMiddleware(null as any)(null as any)
    ).not.toThrow();
  });

  test('return value', () => {
    expect(
      createReduxDevtoolsMiddleware({
        send() {}
      } as any)(() => {})({} as any)
    ).toBeUndefined();
  });

  test('send call', () => {
    const send = jest.fn(() => {});

    createReduxDevtoolsMiddleware({
      send
    } as any)(() => {})({
      state: {
        test: 1
      },
      rootState: {
        formeTest: {
          test: 1
        }
      },
      formeName: 'formeTest',
      actionName: 'testAction'
    });

    const mock = send.mock.calls as any;

    expect(mock[0][1]).toEqual({
      test: 1
    });
  });

  test('send call', () => {
    const next = jest.fn(() => {});

    createReduxDevtoolsMiddleware({
      send() {}
    } as any)(next)({
      state: {
        test: 1
      },
      rootState: {
        formeTest: {
          test: 1
        }
      },
      formeName: 'formeTest',
      actionName: 'testAction'
    });

    const mock = next.mock.calls as any;

    expect(mock[0][0]).toEqual({
      state: {
        test: 1
      },
      rootState: {
        formeTest: {
          test: 1
        }
      },
      formeName: 'formeTest',
      actionName: 'testAction'
    });
  });
});
