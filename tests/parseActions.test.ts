import { parseActions } from '../src/forme/creator';

describe('Test parseActions', () => {
  test('invalide params', () => {
    expect(() =>
      parseActions({}, null as any, null as any, null as any)
    ).not.toThrow();
  });

  test('return value', () => {
    expect(
      parseActions(
        {
          testPipe: (state: any) => {
            return state;
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
