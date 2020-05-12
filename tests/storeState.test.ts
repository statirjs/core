import { createStore } from '../src/core/store';
import { createPiceOfStore } from '../src/core/piceOfStore';

describe('Testing store state', () => {
  test('state init', () => {
    const piceOfState1 = createPiceOfStore(() => ({
      state: {
        count1: 0
      },
      pipes: {
        test: {
          push(state: { count1: number }): { count1: number } {
            return state;
          }
        }
      }
    }));

    const piceOfState2 = createPiceOfStore(() => ({
      state: {
        count2: 0
      },
      pipes: {
        test: {
          push(state: { count2: number }): { count2: number } {
            return state;
          }
        }
      }
    }));

    const store = createStore({
      pices: {
        piceOfState1,
        piceOfState2
      }
    });

    expect(store.state).toEqual({
      piceOfState1: {
        count1: 0
      },
      piceOfState2: {
        count2: 0
      }
    });
  });

  test('state update', () => {
    const piceOfState = createPiceOfStore(() => ({
      state: {
        count: 0
      },
      pipes: {
        test: {
          push(state: { count: number }, payload: number): { count: number } {
            return {
              ...state,
              count: payload
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

    store.dispatch.piceOfState.test(123);

    expect(store.state).toEqual({
      piceOfState: {
        count: 123
      }
    });
  });
});
