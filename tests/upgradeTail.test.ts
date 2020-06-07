import { upgradeTail } from '../src/store/creator';
import { createForme } from '../src/forme/creator';

describe('Test upgradeTail', () => {
  test('invalid params', () => {
    expect(() => upgradeTail(null as any)).toThrow();

    expect(() =>
      upgradeTail({
        formes: {}
      })
    ).not.toThrow();
  });

  test('return value', () => {
    expect(
      upgradeTail({
        formes: {}
      }).state
    ).toEqual({});

    expect(
      upgradeTail({
        formes: {
          testForme: {
            state: {
              test: 1
            },
            getForme() {
              return {};
            }
          }
        }
      } as any).state.testForme.test
    ).toEqual(1);

    expect(
      upgradeTail({
        formes: {}
      }).dispatch
    ).toEqual({});

    expect(
      upgradeTail({
        formes: {}
      }).listeners
    ).toEqual([]);
  });

  test('state save', () => {
    expect(
      upgradeTail({
        formes: {
          testForme: {
            state: {
              test: 2
            },
            getForme() {
              return {};
            }
          }
        },
        middlewares: [
          (next: any) => (update: any) => next(update),
          (next: any) => (update: any) => next(update)
        ]
      } as any).state.testForme.test
    ).toEqual(2);
  });

  test('update save', () => {
    const testForme = createForme(
      {
        test: 1
      },
      () => ({
        actions: {
          testAction(state, payload: number) {
            return {
              ...state,
              test: payload
            };
          }
        }
      })
    );

    const store = upgradeTail({
      formes: {
        testForme
      }
    });

    const update = store.dispatch.testForme.testAction as any;

    update(2);

    expect(store.state.testForme.test).toEqual(2);

    update(4);

    expect(store.state.testForme.test).toEqual(4);
  });

  test('listner update', (done) => {
    const testForme = createForme(
      {
        test: 1
      },
      () => ({
        actions: {
          testAction(state, payload: number) {
            return {
              ...state,
              test: payload
            };
          }
        }
      })
    );

    const store = upgradeTail({
      formes: {
        testForme
      }
    });

    store.subscribe((state) => {
      expect(state.testForme.test).toEqual(2);
      done();
    });

    const update = store.dispatch.testForme.testAction as any;

    update(2);
  });
});
