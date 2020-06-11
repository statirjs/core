import { createMiddlewareTail } from '../src/store/creator';

describe('Test createMiddlewareTail', () => {
  test('invalid params', () => {
    expect(() => createMiddlewareTail(null as any)).not.toThrow();

    expect(() => createMiddlewareTail(null as any)({} as any)).toThrow();
  });

  test('return value', () => {
    const store = {
      state: {
        test: {}
      },
      listeners: [],
      counter: 0
    } as any;

    expect(
      createMiddlewareTail(store)({
        state: {},
        formeName: 'test'
      } as any)
    ).toBeUndefined();
  });

  test('listner update', () => {
    const listner = jest.fn(() => {});

    const store = {
      state: {
        test: {
          count: 1
        }
      },
      listeners: [listner],
      counter: 0
    } as any;

    createMiddlewareTail(store)({
      state: {
        count: 2
      },
      formeName: 'test'
    } as any);

    const mock = listner.mock.calls as any;

    expect(mock[0][0].test.count).toEqual(2);
  });

  test('state save', () => {
    const store = {
      state: {
        forme: {
          test: 1
        }
      },
      listeners: [],
      counter: 0
    } as any;

    const updateState = createMiddlewareTail(store);

    updateState({
      state: {
        test: 1
      },
      formeName: 'forme'
    } as any);

    expect(store.state.forme.test).toEqual(1);

    updateState({
      state: {
        test: 2
      },
      formeName: 'forme'
    } as any);

    expect(store.state.forme.test).toEqual(2);
  });
});
