import { createStore } from '../src/core/store';
import { createPiceOfStore } from '../src/core/piceOfStore';
import { IPushAction, IAction, IStatirMiddleware } from '../src/typing';

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

describe('Testing store middlewares', () => {
  test('invalid config', () => {
    expect(() =>
      createStore({
        pices: { piceOfState },
        middlewares: [(() => {}) as any]
      })
    ).not.toThrow();

    expect(() =>
      createStore({
        pices: { piceOfState },
        middlewares: [
          (() => {
            return () => {};
          }) as IStatirMiddleware
        ]
      })
    ).not.toThrow();

    expect(() =>
      createStore({
        pices: { piceOfState },
        middlewares: [
          (next: IPushAction) => {
            return (action: IAction) => {
              next(action);
            };
          },
          (next: IPushAction) => {
            return (action: IAction) => {
              next(action);
            };
          }
        ]
      })
    ).not.toThrow();
  });

  test('state safety', () => {
    const store = createStore({
      pices: { piceOfState },
      middlewares: [
        (next: IPushAction) => {
          return (action: IAction) => {
            next(action);
          };
        },
        (next: IPushAction) => {
          return (action: IAction) => {
            next(action);
          };
        }
      ]
    });

    expect(store.state.piceOfState.count).toEqual(0);
  });

  test('dispatch safety', () => {
    const store = createStore({
      pices: { piceOfState },
      middlewares: [
        (next: IPushAction) => {
          return (action: IAction) => {
            next(action);
          };
        },
        (next: IPushAction) => {
          return (action: IAction) => {
            next(action);
          };
        }
      ]
    });

    expect(store.state.piceOfState.count).toEqual(0);

    store.dispatch.piceOfState.test(123);

    expect(store.state.piceOfState.count).toEqual(123);
  });

  test('listners safety', () => {
    const listner = jest.fn(() => {});

    const store = createStore({
      pices: { piceOfState },
      middlewares: [
        (next: IPushAction) => {
          return (action: IAction) => {
            next(action);
          };
        }
      ]
    });

    store.addListner(listner);

    store.dispatch.piceOfState.test(123);

    expect(listner.mock.calls.length).toEqual(2);
  });

  test('upgrade compatibility', () => {
    const listner = jest.fn(() => {});

    const store = createStore({
      pices: { piceOfState },
      middlewares: [
        (next: IPushAction) => {
          return (action: IAction) => {
            next(action);
          };
        },
        (next: IPushAction) => {
          return (action: IAction) => {
            next(action);
          };
        }
      ],
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

    expect(store.state.piceOfState.count).toEqual(0);

    store.dispatch.piceOfState.test(123);

    expect(listner.mock.calls.length).toEqual(2);

    expect(store.state.piceOfState.count).toEqual(123);
  });
});
