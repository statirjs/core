import { parsePipes } from '../src/forme/creator';

describe('Test parsePipes', () => {
  test('invalide params', () => {
    expect(() =>
      parsePipes({}, null as any, null as any, null as any)
    ).not.toThrow();
  });

  test('return value', () => {
    expect(
      parsePipes(
        {
          testPipe: {
            push(state: any) {
              return state;
            }
          }
        },
        {
          testState: {
            test: 1
          }
        },
        () => {},
        'testState'
      )['testPipe']
    ).toBeTruthy();
  });
});
