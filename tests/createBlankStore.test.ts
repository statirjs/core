import { createBlankStore } from '../src/store/creator';

describe('Test createBlankStore', () => {
  test('invalid params', () => {
    expect(() => createBlankStore(null as any)).not.toThrow();
  });

  test('state save', () => {
    expect(
      createBlankStore({
        test: {
          count: 0
        }
      }).state
    ).toEqual({
      test: {
        count: 0
      }
    });
  });

  test('dispatch save', () => {
    expect(
      createBlankStore({
        test: {
          count: 0
        }
      }).dispatch
    ).toEqual({});
  });

  test('listeners save', () => {
    expect(
      createBlankStore({
        test: {
          count: 0
        }
      }).listeners
    ).toEqual([]);
  });

  test('listeners save', () => {
    const listener = () => {};

    const store = createBlankStore({
      test: {
        count: 0
      }
    });

    store.subscribe(listener);

    expect(store.listeners).toEqual([listener]);
  });
});
