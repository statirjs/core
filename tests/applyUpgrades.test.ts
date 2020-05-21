import { applyUpgrades } from '../src/store/creator';
import { createForme } from '../src/forme/creator';

describe('Test applyUpgrades', () => {
  test('invalid params', () => {
    expect(() => applyUpgrades(null as any)).toThrow();

    expect(() =>
      applyUpgrades([
        (next: any) => (config: any) => next(config),
        (next: any) => (config: any) => next(config)
      ])
    ).not.toThrow();
  });

  test('state save', () => {
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

    expect(
      applyUpgrades([
        (next: any) => (config: any) => next(config),
        (next: any) => (config: any) => next(config)
      ])({
        forms: {
          testForme
        }
      }).state.testForme.test
    ).toEqual(1);
  });

  test('side effects', () => {
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

    expect(() =>
      applyUpgrades([
        (next: any) => (config: any) => {
          return next(config);
        },
        () => () => {
          throw new Error('test error');
        }
      ])({
        forms: {
          testForme
        }
      })
    ).toThrow('test error');
  });

  test('middlewares update', () => {
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

    const store = applyUpgrades([
      (next: any) => (config: any) => {
        return next(config);
      },
      (next: any) => (config: any) => {
        return next({
          ...config,
          middlewares: [
            ...(config.middlewares || []),
            (n: any) => (update: any) =>
              n({
                ...update,
                state: {
                  ...update.state,
                  test: update.state.test + 3
                }
              })
          ]
        });
      }
    ])({
      forms: {
        testForme
      }
    });

    const update = store.dispatch.testForme.testAction as any;

    update(0);

    expect(store.state.testForme.test).toEqual(3);

    update(1);

    expect(store.state.testForme.test).toEqual(4);
  });
});
