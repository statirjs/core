import { updateDispatch } from '../src/store/creator';

describe('Test updateDispatch', () => {
  test('invalid params', () => {
    expect(() =>
      updateDispatch(null as any, null as any, null as any)
    ).toThrow();
  });

  test('return value', () => {
    expect(
      updateDispatch(
        {
          forme: {
            state: {
              test: 1
            },
            getForme(): any {
              return {};
            }
          }
        },
        {
          state: {
            forme: {
              test: 1
            }
          },
          dispatch: {}
        } as any,
        () => {}
      )
    ).toBeUndefined();
  });

  test('dispatch action', () => {
    const dispatch: any = {};

    updateDispatch(
      {
        forme: {
          state: {
            test: 1
          },
          getForme(): any {
            return {
              actions: {
                testAction() {
                  return {
                    value: 'test'
                  };
                }
              },
              pipes: {}
            };
          }
        }
      },
      {
        state: {
          forme: {
            test: 1
          }
        },
        dispatch: dispatch
      } as any,
      () => {}
    );

    expect(dispatch.forme.testAction()).toEqual({
      value: 'test'
    });
  });

  test('dispatch pipe', () => {
    const dispatch: any = {};

    updateDispatch(
      {
        forme: {
          state: {
            test: 1
          },
          getForme(): any {
            return {
              actions: {},
              pipes: {
                testPipe() {
                  return {
                    value: 'test'
                  };
                }
              }
            };
          }
        }
      },
      {
        state: {
          forme: {
            test: 1
          }
        },
        dispatch: dispatch
      } as any,
      () => {}
    );

    expect(dispatch.forme.testPipe()).toEqual({
      value: 'test'
    });
  });
});
