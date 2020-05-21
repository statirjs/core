import { createMiddlewareTail } from '../src/store/creator';

describe('Test createMiddlewareTail', () => {
  test('invalid params', () => {
    expect(() => createMiddlewareTail(null as any, [])).not.toThrow();

    expect(() => createMiddlewareTail(null as any, [])({} as any)).toThrow();
  });

  test('return value', () => {
    const rootState = { test: {} };

    expect(
      createMiddlewareTail(
        rootState,
        []
      )({
        state: {},
        formeName: 'test'
      } as any)
    ).toBeUndefined();
  });

  test('listner update', () => {
    const listner = jest.fn(() => {});

    const rootState = {
      test: {
        count: 1
      }
    };

    createMiddlewareTail(rootState, [listner])({
      state: {
        count: 2
      },
      formeName: 'test'
    } as any);

    const mock = listner.mock.calls as any;

    expect(mock[0][0].test.count).toEqual(2);
  });

  test('state save', () => {
    const rootState = {
      forme: {
        test: 1
      }
    };

    const updateState = createMiddlewareTail(rootState, []);

    updateState({
      state: {
        test: 1
      },
      formeName: 'forme'
    } as any);

    expect(rootState.forme.test).toEqual(1);

    updateState({
      state: {
        test: 2
      },
      formeName: 'forme'
    } as any);

    expect(rootState.forme.test).toEqual(2);
  });
});
