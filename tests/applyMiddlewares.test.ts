import { applyMiddlewares } from '../src/store/creator';

describe('Test applyMiddlewares', () => {
  test('invalid params', () => {
    expect(() => applyMiddlewares(null as any, null as any)).toThrow();

    expect(() => applyMiddlewares([], {} as any)).not.toThrow();
  });

  test('return value', () => {
    const updateState = applyMiddlewares(
      [
        (next: any) => (update: any) => next(update),
        (next: any) => (update: any) => next(update),
        (next: any) => (update: any) => next(update)
      ],
      {
        state: {
          forme: {
            test: 1
          }
        },
        listeners: [],
        counter: 0
      } as any
    );

    expect(
      updateState({
        state: {
          test: 1
        },
        rootState: {
          forme: {
            test: 1
          }
        },
        formeName: 'forme',
        actionName: 'testActipn'
      })
    ).toBeUndefined();
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

    const updateState = applyMiddlewares(
      [
        (next: any) => (update: any) => next(update),
        (next: any) => (update: any) => next(update),
        (next: any) => (update: any) => next(update)
      ],
      store
    );

    updateState({
      state: {
        test: 1
      },
      rootState: {
        forme: {
          test: 1
        }
      },
      formeName: 'forme',
      actionName: 'testActipn'
    });

    expect(store.state.forme.test).toEqual(1);

    updateState({
      state: {
        test: 2
      },
      rootState: {
        forme: {
          test: 1
        }
      },
      formeName: 'forme',
      actionName: 'testActipn'
    });

    expect(store.state.forme.test).toEqual(2);
  });

  test('side effects', () => {
    const store = {
      state: {
        forme: {
          test: 1
        }
      },
      listeners: [],
      counter: 0
    } as any;

    const updateState = applyMiddlewares(
      [
        (next: any) => (update: any) => next(update),
        (next: any) => (update: any) => next(update),
        () => () => {
          throw new Error('test error');
        }
      ],
      store
    );

    expect(() =>
      updateState({
        state: {
          test: 1
        },
        rootState: {
          forme: {
            test: 1
          }
        },
        formeName: 'forme',
        actionName: 'testActipn'
      })
    ).toThrow('test error');
  });

  test('state update', () => {
    const store = {
      state: {
        forme: {
          test: 1
        }
      },
      listeners: [],
      counter: 0
    } as any;

    const updateState = applyMiddlewares(
      [
        (next: any) => (update: any) =>
          next({
            ...update,
            state: {
              ...update.state,
              test: update.state.test + 1
            }
          }),
        (next: any) => (update: any) => next(update),
        (next: any) => (update: any) =>
          next({
            ...update,
            state: {
              ...update.state,
              test: update.state.test + 1
            }
          })
      ],
      store
    );

    updateState({
      state: {
        test: 2
      },
      rootState: {
        forme: {
          test: 1
        }
      },
      formeName: 'forme',
      actionName: 'testActipn'
    });

    expect(store.state.forme.test).toEqual(4);
  });
});
