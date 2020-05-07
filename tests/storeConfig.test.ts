import { createStore } from '../src';

describe('Testing createStore config', () => {
  test('whithout config', () => {
    expect(() => createStore(undefined as any)).toThrow();

    expect(() => createStore(null as any)).toThrow();
  });

  test('empty config', () => {
    expect(() => createStore({} as any)).toThrow();
  });

  test('empty options', () => {
    expect(() =>
      createStore({
        pices: {}
      })
    ).not.toThrow();

    expect(() =>
      createStore({
        pices: {},
        upgrades: []
      })
    ).not.toThrow();

    expect(() =>
      createStore({
        pices: {},
        middlewares: []
      })
    ).not.toThrow();
  });
});
