import { createStore } from '../src/core/store';
import { createPiceOfStore } from '../src/core/piceOfStore';

describe('Testing store listners', () => {
  test('listners subscribe', () => {
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

    const store = createStore({
      pices: {
        piceOfState
      }
    });

    expect(() => store.addListner(() => {})).not.toThrow();
    expect(() => store.addListner(() => {})).not.toThrow();
  });

  test('listners update state', (done) => {
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

    const store = createStore({
      pices: {
        piceOfState
      }
    });

    store.addListner(({ piceOfState }) => {
      expect(piceOfState.count).toEqual(123);
      done();
    });

    store.dispatch.piceOfState.test(123);
  });

  test('listners calling', () => {
    const listner = jest.fn(() => {});

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

    const store = createStore({
      pices: {
        piceOfState
      }
    });

    store.addListner(listner);

    store.dispatch.piceOfState.test(1000);

    expect(listner.mock.calls.length).toEqual(2);

    const firstCall = (listner.mock.calls[0] as any)[0] as any;

    expect(firstCall.piceOfState.count).toEqual(1000);

    store.dispatch.piceOfState.test(2000);

    expect(listner.mock.calls.length).toEqual(4);

    const secondCall = (listner.mock.calls[2] as any)[0] as any;

    expect(secondCall.piceOfState.count).toEqual(2000);
  });
});
