import { applyMiddlewares } from '../src/store/creator';

describe('Test applyMiddlewares', () => {
  test('invalid params', () => {
    expect(() => applyMiddlewares(null as any, null as any, [])).toThrow();

    expect(() => applyMiddlewares([], {}, [])).not.toThrow();
  });

  test('return value', () => {
    const updateState = applyMiddlewares(
      [
        (next: any) => (update: any) => next(update),
        (next: any) => (update: any) => next(update),
        (next: any) => (update: any) => next(update)
      ],
      {
        forme: {
          test: 1
        }
      },
      []
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
    const rootState = {
      forme: {
        test: 1
      }
    };

    const updateState = applyMiddlewares(
      [
        (next: any) => (update: any) => next(update),
        (next: any) => (update: any) => next(update),
        (next: any) => (update: any) => next(update)
      ],
      rootState,
      []
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

    expect(rootState.forme.test).toEqual(1);

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

    expect(rootState.forme.test).toEqual(2);
  });

  test('side effects', () => {
    const rootState = {
      forme: {
        test: 1
      }
    };

    const updateState = applyMiddlewares(
      [
        (next: any) => (update: any) => next(update),
        (next: any) => (update: any) => next(update),
        () => () => {
          throw new Error('test error');
        }
      ],
      rootState,
      []
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
    const rootState = {
      forme: {
        test: 1
      }
    };

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
      rootState,
      []
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

    expect(rootState.forme.test).toEqual(4);
  });
});
