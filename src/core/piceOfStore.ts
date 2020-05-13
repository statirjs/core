import {
  IPayload,
  IAction,
  IPoS,
  POS_FIELDS,
  PIPE_ACTIONS,
  IRootState,
  IDispatch,
  IPushAction,
  IRExtractPipe,
  IRExtractPipes,
  IRPoSBuilder,
  IPoSBuilder,
  IRExtractAction,
  IRExtractActions
} from '../typing';
import { warning } from '../utils';

const pipeCore = () => {};

const pipeDone = <T>(state: T) => state;

const pipeFail = <T>(state: T) => state;

export function createUpdateAction<T>(
  state: T,
  payload: IPayload,
  piceOfStateName: string,
  pipeName: string,
  actionName?: string
): IAction<T> {
  return {
    state,
    payload,
    piceOfStore: piceOfStateName,
    pipe: pipeName,
    action: actionName
  };
}

export function parsePipe<
  T,
  K extends NonNullable<IPoS<T>[POS_FIELDS.PIPES]>[string]
>(
  pipe: K,
  rootState: IRootState,
  pushAction: IPushAction<T>,
  piceOfStateName: string,
  pipeName: string
): IRExtractPipe<K> {
  warning([[typeof pipe !== 'object', 'Pice of store pipe must be a object']]);

  const core = pipe.core || pipeCore;
  const done = pipe.done || pipeDone;
  const fail = pipe.fail || pipeFail;

  function pushCurrentAction(state: T, payload: IPayload, actionName: string) {
    const action = createUpdateAction(
      state,
      payload,
      piceOfStateName,
      pipeName,
      actionName
    );
    pushAction(action);
  }

  return function (payload: IPayload) {
    const statePoS = rootState[piceOfStateName];
    const statePush = pipe.push(statePoS, payload, rootState);
    pushCurrentAction(statePush, payload, PIPE_ACTIONS.PUSH);

    try {
      const data = core(statePush, payload, rootState);
      const stateDone = done<T>(statePush, data, payload, rootState);
      pushCurrentAction(stateDone, payload, PIPE_ACTIONS.DONE);
    } catch (err) {
      const stateFail = fail<T>(statePush, err, payload, rootState);
      pushCurrentAction(stateFail, payload, PIPE_ACTIONS.FAIL);
    }
  } as IRExtractPipe<K>;
}

export function parsePipes<T, K extends NonNullable<IPoS<T>[POS_FIELDS.PIPES]>>(
  pipes: K,
  rootState: IRootState,
  pushAction: IPushAction<T>,
  piceOfStateName: string
): IRExtractPipes<K> {
  warning([
    [typeof pipes !== 'object', 'Pice of store pipes must be a object']
  ]);

  return Object.keys(pipes).reduce(
    (acc, pipeName) => ({
      ...acc,
      [pipeName]: parsePipe(
        pipes[pipeName],
        rootState,
        pushAction,
        piceOfStateName,
        pipeName
      )
    }),
    {} as IRExtractPipes<K>
  );
}

export function parseAction<
  T,
  K extends NonNullable<IPoS<T>[POS_FIELDS.ACTIONS]>[string]
>(
  action: K,
  rootState: IRootState,
  pushAction: IPushAction<T>,
  piceOfStateName: string,
  actionName: string
): IRExtractAction<K> {
  function pushCurrentAction(state: T, payload: IPayload) {
    const action = createUpdateAction(
      state,
      payload,
      piceOfStateName,
      actionName
    );
    pushAction(action);
  }

  return function (payload: IPayload) {
    const statePoS = rootState[piceOfStateName];
    const state = action(statePoS, payload);
    pushCurrentAction(state, payload);
  } as IRExtractAction<K>;
}

export function parseActions<
  T,
  K extends NonNullable<IPoS<T>[POS_FIELDS.ACTIONS]>
>(
  actions: K,
  rootState: IRootState,
  pushAction: IPushAction<T>,
  piceOfStateName: string
): IRExtractActions<K> {
  warning([
    [typeof actions !== 'object', 'Pice of store actions must be a object']
  ]);

  return Object.keys(actions).reduce(
    (acc, actionName) => ({
      ...acc,
      [actionName]: parseAction(
        actions[actionName],
        rootState,
        pushAction,
        piceOfStateName,
        actionName
      )
    }),
    {} as IRExtractActions<K>
  );
}

export function createPiceOfStore<T, K extends IPoS<T>>(
  builder: IPoSBuilder<K>
): IRPoSBuilder<T, K> {
  return function (
    name: string,
    rootState: IRootState,
    dispatch: IDispatch,
    pushAction: IPushAction<T>
  ) {
    warning([
      [typeof builder !== 'function', 'Pice of store is not a function']
    ]);

    const { pipes = {}, actions = {}, state } = builder(dispatch);

    warning([
      [!state, `Pice of store state is required`],
      [typeof state !== 'object', 'Pice of store state must be a object']
    ]);

    return {
      state,
      pipes: parsePipes(pipes, rootState, pushAction, name),
      actions: parseActions(actions, rootState, pushAction, name)
    };
  };
}
