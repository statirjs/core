import { createPiceOfStore } from '../src/core/piceOfStore';

const posState = {
  state: {
    test: 1
  }
};

describe('Testing pice of store state', () => {
  test('rootState safety', () => {
    expect(() =>
      createPiceOfStore(() => posState)(
        'test',
        {},
        () => {},
        () => {}
      )
    ).not.toThrow();

    expect(() =>
      createPiceOfStore(() => posState)(
        'test',
        {
          test: {
            test: 2
          }
        },
        () => {},
        () => {}
      )
    ).not.toThrow();
  });

  test('state safety', () => {
    expect(
      createPiceOfStore(() => posState)(
        'test',
        {
          test: {
            test: 1
          }
        },
        () => {},
        () => {}
      ).state.test
    ).toEqual(1);

    expect(() =>
      createPiceOfStore(() => ({
        state: null
      }))(
        'test',
        {
          test: {
            test: 1
          }
        },
        () => {},
        () => {}
      )
    ).toThrow();

    expect(() =>
      createPiceOfStore(() => ({
        state: 'test'
      }))(
        'test',
        {
          test: {
            test: 1
          }
        },
        () => {},
        () => {}
      )
    ).toThrow();
  });
});
