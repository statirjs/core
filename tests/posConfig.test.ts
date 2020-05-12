import { createPiceOfStore } from '../src/core/piceOfStore';

const posState = {
  state: {
    test: 1
  }
};

describe('Testing pice of store config', () => {
  test('empty builder', () => {
    expect(() => createPiceOfStore(undefined as any)).not.toThrow();

    expect(() => createPiceOfStore(null as any)).not.toThrow();

    expect(() =>
      createPiceOfStore(undefined as any)(
        'testPoS',
        {},
        () => {},
        () => {}
      )
    ).toThrow();
  });

  test('empty options', () => {
    expect(() =>
      createPiceOfStore(() => posState)(
        null as any,
        null as any,
        null as any,
        null as any
      )
    ).not.toThrow();

    expect(() =>
      createPiceOfStore(() => posState)(
        'testPos',
        null as any,
        null as any,
        null as any
      )
    ).not.toThrow();

    expect(() =>
      createPiceOfStore(() => posState)(
        'testPos',
        { testPos: { test: 2 } },
        null as any,
        null as any
      )
    ).not.toThrow();

    expect(() =>
      createPiceOfStore(() => posState)(
        'testPos',
        { testPos: { test: 2 } },
        () => {},
        null as any
      )
    ).not.toThrow();

    expect(() =>
      createPiceOfStore(() => posState)(
        'testPos',
        { testPos: { test: 2 } },
        () => {},
        () => {}
      )
    ).not.toThrow();
  });
});
