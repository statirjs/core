import { extractState } from '../src/store/creator';

describe('Test extractState', () => {
  test('invalid params', () => {
    expect(() => extractState(null as any)).toThrow();
  });

  test('state reduce', () => {
    expect(
      extractState({
        test1: {
          state: {
            test: 1
          }
        },
        test2: {
          state: {
            test: 1
          }
        }
      } as any)
    ).toEqual({
      test1: {
        test: 1
      },
      test2: {
        test: 1
      }
    });
  });
});
