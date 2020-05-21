import { initStore } from '../src/store/creator';

describe('Test initStore', () => {
  test('invalid params', () => {
    expect(() => initStore(null as any)).toThrow();

    expect(() =>
      initStore({
        forms: 1
      } as any)
    ).toThrow('Forms must be a object');

    expect(() =>
      initStore({
        forms: {},
        middlewares: 1
      } as any)
    ).toThrow();

    expect(() =>
      initStore({
        forms: {},
        upgrades: 1
      } as any)
    ).toThrow();
  });
});
