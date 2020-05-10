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
  IRPoSBuilders,
  IPoSBuilder,
  IStatirStore,
  IStoreListner,
  IExtractStoreState,
  IStatirMiddleware,
  IRPoSs,
  IExtractStoreDispatch,
  IStatirConfig,
  IStatirCreateStore,
  IStatirUpgrade
} from './types';
import { warning } from './warning';
import { reduxDevtoolsUpgrade } from './devtool';

const pipeCore = () => {};

const pipeDone = <T>(state: T) => state;

const pipeFail = <T>(state: T) => state;

export function createUpdateAction<T>(
  state: T,
  payload: IPayload,
  piceOfStateName: string,
  pipeName: string,
  actionName: string
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
  K extends NonNullable<IPoS[POS_FIELDS.PIPES]>[string]
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
      const stateDone = done(statePush, data, payload, rootState);
      pushCurrentAction(stateDone, payload, PIPE_ACTIONS.DONE);
    } catch (err) {
      const stateFail = fail(statePush, err, payload, rootState);
      pushCurrentAction(stateFail, payload, PIPE_ACTIONS.FAIL);
    }
  } as IRExtractPipe<K>;
}

export function parsePipes<T, K extends NonNullable<IPoS[POS_FIELDS.PIPES]>>(
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

    const { pipes = {}, state } = builder(dispatch);

    warning([
      [!state, `Pice of store state is required`],
      [typeof state !== 'object', 'Pice of store state must be a object']
    ]);

    return {
      state,
      pipes: parsePipes(pipes, rootState, pushAction, name)
    };
  };
}

export function createBlankStore<T>(initState: T): IStatirStore<T> {
  return {
    state: initState,
    dispatch: {},
    listners: [],
    addListner(listner: IStoreListner<T>) {
      this.listners.push(listner);
    }
  };
}

export function extractState<T extends IRPoSBuilders>(
  pices: T
): IExtractStoreState<T> {
  return Object.keys(pices).reduce(
    (acc, key) => ({
      ...acc,
      [key]: pices[key](key, { [key]: {} }, {}, () => {}).state
    }),
    {} as IExtractStoreState<T>
  );
}

export function createPushActionTail<T>(
  state: T,
  listners: IStoreListner<T>[]
) {
  return function (action: IAction) {
    const nextState = {
      ...state,
      [action.piceOfStore]: {
        ...action.state
      }
    };

    Object.assign(state, nextState);

    listners.forEach((listner) => listner(state));
  };
}

export function composeMiddlewares(
  middlewares: IStatirMiddleware[],
  tail: IPushAction
): IPushAction {
  return middlewares.reduce((acc, next) => {
    const result = next(acc);
    return result;
  }, tail);
}

export function createPushAction<T>(
  state: T,
  listners: IStoreListner<T>[],
  middlewares: IStatirMiddleware[] = []
) {
  const pushActionTail = createPushActionTail(state, listners);
  const pushAction = composeMiddlewares(middlewares, pushActionTail);

  return pushAction;
}

export function extractPices<T>(
  state: T,
  dispatch: IDispatch,
  pushAction: IPushAction,
  pices: IRPoSBuilders
) {
  return Object.keys(pices).reduce(
    (acc, key) => ({
      ...acc,
      [key]: pices[key](key, state, dispatch, pushAction)
    }),
    {}
  );
}

export function updateDispatcher(pices: IRPoSs, dispatch: IDispatch) {
  const res = Object.keys(pices)
    .map((key) => ({
      [key]: pices[key].pipes
    }))
    .reduce(
      (acc, next) => ({
        ...acc,
        ...next
      }),
      {}
    );

  Object.assign(dispatch, res);
}

export function initStore<T extends IRPoSBuilders>(
  config: IStatirConfig<T>
): IStatirStore<IExtractStoreState<T>, IExtractStoreDispatch<T>> {
  const initState = extractState(config.pices);
  const store = createBlankStore(initState);

  const pushAction = createPushAction(
    store.state,
    store.listners,
    config.middlewares
  );

  const pices = extractPices(
    store.state,
    store.dispatch,
    pushAction,
    config.pices
  );

  updateDispatcher(pices, store.dispatch);
  return store;
}

export function warningUpgrades(createStore: IStatirCreateStore<any>) {
  const test = createPiceOfStore(() => ({
    state: {
      count: 0
    }
  }));

  const store = createStore({
    pices: {
      test
    }
  });

  warning([[!store, 'Upgrade must return store']]);
}

export function composeUpgrades<T extends IRPoSBuilders>(
  upgrades: IStatirUpgrade<T>[],
  tail: IStatirCreateStore<T>
) {
  return upgrades.reduce((acc, next) => {
    const result = next(acc);
    warningUpgrades(result);

    return result;
  }, tail);
}

export function createStore<T extends IRPoSBuilders>(
  config: IStatirConfig<T>
): IStatirStore<IExtractStoreState<T>, IExtractStoreDispatch<T>> {
  warning([
    [!config, 'Config not provided'],
    [!config.pices, 'Store pices not provided']
  ]);

  const upgrades = config.upgrades || [];
  const upgradesWithDevtools = [reduxDevtoolsUpgrade, ...upgrades];
  const upgradeTail: IStatirCreateStore<T> = initStore;
  const upgradedInitStore = composeUpgrades(upgradesWithDevtools, upgradeTail);

  return upgradedInitStore(config);
}
