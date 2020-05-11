import { createStore, createPiceOfStore } from '../src/core';

const piceOfState = createPiceOfStore(() => ({
  state: {
    count: 0
  },
  pipes: {
    test: {
      push(state: any, payload: number) {
        return {
          ...state,
          count: payload
        };
      }
    }
  }
}));

describe('Testing store upgrades', () => {
  test('invalid config', () => {
    expect(() =>
      createStore({
        pices: { piceOfState },
        upgrades: [(() => {}) as any]
      })
    ).toThrow();

    expect(() =>
      createStore({
        pices: { piceOfState },
        upgrades: [
          (() => {
            return () => {};
          }) as any
        ]
      })
    ).toThrow();

    expect(() =>
      createStore({
        pices: { piceOfState },
        upgrades: [
          ((createStore: any) => {
            return (config: any) => {
              return createStore(config);
            };
          }) as any
        ]
      })
    ).not.toThrow();
  });

  test('state safety', () => {
    const store = createStore({
      pices: { piceOfState },
      upgrades: [
        ((createStore: any) => {
          return (config: any) => {
            return createStore(config);
          };
        }) as any,
        ((createStore: any) => {
          return (config: any) => {
            return createStore(config);
          };
        }) as any
      ]
    });

    expect(store.state.piceOfState.count).toEqual(0);
  });

  test('dispatch safety', () => {
    const store = createStore({
      pices: { piceOfState },
      upgrades: [
        ((createStore: any) => {
          return (config: any) => {
            return createStore(config);
          };
        }) as any,
        ((createStore: any) => {
          return (config: any) => {
            return createStore(config);
          };
        }) as any
      ]
    });

    store.dispatch.piceOfState.test(123);

    expect(store.state.piceOfState.count).toEqual(123);
  });

  test('listners safety', () => {
    const listner = jest.fn(() => {});

    const store = createStore({
      pices: { piceOfState },
      upgrades: [
        ((createStore: any) => {
          return (config: any) => {
            return createStore(config);
          };
        }) as any,
        ((createStore: any) => {
          return (config: any) => {
            return createStore(config);
          };
        }) as any
      ]
    });

    store.addListner(listner);

    store.dispatch.piceOfState.test(123);

    expect(listner.mock.calls.length).toEqual(2);
  });
});
