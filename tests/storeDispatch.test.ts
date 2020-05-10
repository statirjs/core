import { createPiceOfStore, createStore } from '../src/core';

describe('Testing store dispatch', () => {
  test('dispatch push update', () => {
    const piceOfState = createPiceOfStore(() => ({
      state: {
        count: 0
      },
      pipes: {
        test: {
          push(state: any) {
            return {
              ...state,
              count: state.count + 1
            };
          }
        }
      }
    }));

    const store = createStore({
      pices: {
        piceOfState
      }
    });

    store.dispatch.piceOfState.test();
    store.dispatch.piceOfState.test();

    expect(store.state.piceOfState.count).toEqual(2);
  });

  test('dispatch done update', () => {
    const piceOfState = createPiceOfStore(() => ({
      state: {
        count: 0
      },
      pipes: {
        test: {
          push(state: any) {
            return state;
          },
          done(state: any) {
            return {
              ...state,
              count: state.count + 1
            };
          }
        }
      }
    }));

    const store = createStore({
      pices: {
        piceOfState
      }
    });

    store.dispatch.piceOfState.test();
    store.dispatch.piceOfState.test();

    expect(store.state.piceOfState.count).toEqual(2);
  });

  test('dispatch fail update', () => {
    const piceOfState = createPiceOfStore(() => ({
      state: {
        count: 0
      },
      pipes: {
        test: {
          push(state: any) {
            return state;
          },
          fail(state: any) {
            return {
              ...state,
              count: state.count + 1
            };
          }
        }
      }
    }));

    const store = createStore({
      pices: {
        piceOfState
      }
    });

    store.dispatch.piceOfState.test();
    store.dispatch.piceOfState.test();

    expect(store.state.piceOfState.count).toEqual(0);
  });

  test('dispatch pipe done', () => {
    const piceOfState = createPiceOfStore(() => ({
      state: {
        countDone: 0,
        countFail: 0
      },
      pipes: {
        test: {
          push(state: any) {
            return state;
          },
          core(state: any) {
            return state;
          },
          done(state: any) {
            return {
              ...state,
              countDone: state.countDone + 1
            };
          },
          fail(state: any) {
            return {
              ...state,
              countFail: state.countFail + 1
            };
          }
        }
      }
    }));

    const store = createStore({
      pices: {
        piceOfState
      }
    });

    store.dispatch.piceOfState.test();
    store.dispatch.piceOfState.test();

    expect(store.state.piceOfState.countDone).toEqual(2);
    expect(store.state.piceOfState.countFail).toEqual(0);
  });

  test('dispatch pipe fail', () => {
    const piceOfState = createPiceOfStore(() => ({
      state: {
        countDone: 0,
        countFail: 0
      },
      pipes: {
        test: {
          push(state: any) {
            return state;
          },
          core() {
            throw new Error('core error');
          },
          done(state: any) {
            return {
              ...state,
              countDone: state.countDone + 1
            };
          },
          fail(state: any) {
            return {
              ...state,
              countFail: state.countFail + 1
            };
          }
        }
      }
    }));

    const store = createStore({
      pices: {
        piceOfState
      }
    });

    store.dispatch.piceOfState.test();
    store.dispatch.piceOfState.test();

    expect(store.state.piceOfState.countDone).toEqual(0);
    expect(store.state.piceOfState.countFail).toEqual(2);
  });
});
