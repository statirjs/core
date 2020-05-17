import { defaultPipeAction } from '../src/forme/creator';

describe('Test defaultPipeAction', () => {
  test('return value', () => {
    expect(defaultPipeAction({})).toEqual({});

    expect(defaultPipeAction(null)).toEqual(null);

    expect(defaultPipeAction(1)).toEqual(1);

    expect(defaultPipeAction('test')).toEqual('test');
  });
});
