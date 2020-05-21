import { formateReduxDevtoolsActionName } from '../src/upgrades/devtool';

describe('Test formateReduxDevtoolsActionName', () => {
  test('return value', () => {
    expect(
      formateReduxDevtoolsActionName({
        formeName: 'action',
        actionName: 'test'
      } as any)
    ).toEqual('action/test');
  });
});
