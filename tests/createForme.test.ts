import { createForme } from '../src/forme/creator';

describe('Test createForme', () => {
  test('invalid params', () => {
    expect(() => createForme(null as any, null as any)).not.toThrow();

    expect(() =>
      createForme(null as any, null as any).getForme(
        null as any,
        null as any,
        null as any,
        null as any
      )
    ).not.toThrow();

    expect(() =>
      createForme(null as any, () => ({
        actions: 1 as any
      })).getForme(null as any, null as any, null as any, 'testForme')
    ).toThrow('Frome testForme: actions must be a object');

    expect(() =>
      createForme(null as any, () => ({
        actions: {
          testActin(state: any) {
            return state;
          }
        },
        pipes: 1 as any
      })).getForme(null as any, null as any, null as any, 'testForme')
    ).toThrow('Forme testForme: pipes must be a object');
  });

  test('state save', () => {
    expect(
      createForme(
        {
          test: 1
        },
        () => ({
          actions: {},
          pipes: {}
        })
      ).state.test
    ).toEqual(1);
  });

  test('dispatch save', () => {
    const formeBody = jest.fn(() => ({
      actions: {},
      pipes: {}
    }));

    const reFormeBuilder = createForme(
      {
        test: 1
      },
      formeBody
    );

    reFormeBuilder.getForme(
      {
        testForme: {
          test: 1
        }
      },
      {
        isDispatch: true
      },
      () => {},
      'testForme'
    );

    const mock = formeBody.mock.calls as any;

    expect(mock.length).toEqual(1);

    expect(mock[0][0]).toEqual({
      isDispatch: true
    });
  });

  test('updateState use', () => {
    const updateState = jest.fn(() => {});

    const reFormeBuilder = createForme(
      {
        test: 1
      },
      () => ({
        actions: {
          testAction(state) {
            return state;
          }
        },
        pipes: {
          testPipe: {
            push(state, payload: number) {
              return {
                ...state,
                test: state.test + payload
              };
            }
          }
        }
      })
    );

    const parseForme = reFormeBuilder.getForme(
      {
        testForme: {
          test: 1
        }
      },
      {},
      updateState,
      'testForme'
    );

    const mock = updateState.mock.calls as any;

    parseForme.actions.testAction();

    expect(mock.length).toEqual(1);

    expect(mock[0][0].state).toEqual({ test: 1 });

    expect(mock[0][0].formeName).toEqual('testForme');

    expect(mock[0][0].actionName).toEqual('testAction');

    expect(mock[0][0].rootState).toEqual({
      testForme: {
        test: 1
      }
    });

    const testPipe = parseForme.pipes.testPipe as any;

    testPipe(0);

    expect(mock.length).toEqual(3);

    expect(mock[1][0].state).toEqual({ test: 1 });

    expect(mock[1][0].formeName).toEqual('testForme');

    expect(mock[1][0].actionName).toEqual('testPipe:push');

    expect(mock[1][0].rootState).toEqual({
      testForme: {
        test: 1
      }
    });

    testPipe(1);

    expect(mock.length).toEqual(5);

    expect(mock[3][0].state).toEqual({ test: 2 });
  });
});
