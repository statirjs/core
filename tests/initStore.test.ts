import { initStore } from '../src/store/creator';

describe('Test initStore', () => {
  test('invalid params', () => {
    expect(() => initStore(null as any)).toThrow();

    expect(() =>
      initStore({
        formes: 1
      } as any)
    ).toThrow('Formes must be a object');

    expect(() =>
      initStore({
        formes: {},
        middlewares: 1
      } as any)
    ).toThrow();

    expect(() =>
      initStore({
        formes: {},
        upgrades: 1
      } as any)
    ).toThrow();
  });
});
