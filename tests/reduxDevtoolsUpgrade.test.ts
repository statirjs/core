import { reduxDevtoolsUpgrade } from '../src/upgrades/devtool';
import { createForme } from '../src/forme/creator';

describe('Test reduxDevtoolsUpgrade', () => {
  test('invalid params', () => {
    expect(() => reduxDevtoolsUpgrade(null as any)).not.toThrow();

    expect(() => reduxDevtoolsUpgrade(null as any)(null as any)).toThrow();
  });

  test('next call', () => {
    const next = jest.fn((state: any) => state);

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

    reduxDevtoolsUpgrade(next as any)({
      formes: {
        testForme
      }
    });

    const mock = next.mock.calls as any;

    expect(mock.length).toEqual(1);

    expect(mock[0][0]).toEqual({
      formes: {
        testForme
      }
    });
  });
});
