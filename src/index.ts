interface Window {
  __REDUX_DEVTOOLS_EXTENSION__: any;
}

type IDispatch = {
  [X: string]: any;
};
type IRootState = {
  [X: string]: any;
};
type IPayload = any;

interface IAction<T extends any = any> {
  piceOfStore: string;
  pipe: string;
  action: string;
  payload: IPayload;
  state: T;
}

type IUpdateState<T extends any = any> = (action: IAction<T>) => void;

interface IPoSPipe<T extends any = any, K = any> {
  push(state: T, payload: IPayload, rootState: IRootState): T;
  core?(state: T, payload: IPayload, rootState: IRootState): Promise<K> | K;
  done?(state: T, data: K, payload: IPayload, rootState: IRootState): T;
  fail?(state: T, error: Error, payload: IPayload, rootState: IRootState): T;
}

enum PIPE_ACTIONS {
  PUSH = 'push',
  CORE = 'core',
  DONE = 'done',
  FAIL = 'fail'
}

enum POS_FIELDS {
  NAME = 'name',
  STATE = 'state',
  PIPES = 'pipes'
}

type IPoSPipes<T, K extends string = string> = {
  [X in K]: IPoSPipe<T>;
};

interface IPoS<T extends any = any> {
  state: T;
  pipes?: IPoSPipes<T>;
}

type IRExtractPushPayload<
  T extends IPoSPipe
> = T[PIPE_ACTIONS.PUSH] extends () => void
  ? null
  : T[PIPE_ACTIONS.PUSH] extends (state: infer S) => infer S
  ? null
  : T[PIPE_ACTIONS.PUSH] extends (state: infer S, payload: infer K) => infer S
  ? K
  : null;

type IRExtractCorePayload<
  T extends IPoSPipe
> = T[PIPE_ACTIONS.CORE] extends () => void
  ? null
  : T[PIPE_ACTIONS.CORE] extends (state: infer S) => infer P
  ? null
  : T[PIPE_ACTIONS.CORE] extends (state: infer S, payload: infer K) => infer P
  ? K
  : null;

type IRExtractDonePayload<
  T extends IPoSPipe
> = T[PIPE_ACTIONS.DONE] extends () => void
  ? null
  : T[PIPE_ACTIONS.DONE] extends (state: infer S) => infer S
  ? null
  : T[PIPE_ACTIONS.DONE] extends (state: infer S, data: infer P) => infer S
  ? null
  : T[PIPE_ACTIONS.DONE] extends (
      state: infer S,
      data: infer P,
      payload: infer K
    ) => infer S
  ? K
  : null;

type IRExtractFailPayload<
  T extends IPoSPipe
> = T[PIPE_ACTIONS.FAIL] extends () => void
  ? null
  : T[PIPE_ACTIONS.FAIL] extends (state: infer S) => infer S
  ? null
  : T[PIPE_ACTIONS.FAIL] extends (state: infer S, error: infer P) => infer S
  ? null
  : T[PIPE_ACTIONS.FAIL] extends (
      state: infer S,
      error: infer P,
      payload: infer K
    ) => infer S
  ? K
  : null;

type IRExtractPayload<T extends IPoSPipe> = NonNullable<
  | IRExtractPushPayload<T>
  | IRExtractCorePayload<T>
  | IRExtractDonePayload<T>
  | IRExtractFailPayload<T>
>;

type IRExtractPipe<
  T extends NonNullable<IPoS[POS_FIELDS.PIPES]>[string],
  K = IRExtractPayload<T>
> = [K] extends [void] ? () => void : (payload: K) => void;

type IRExtractPipes<T extends IPoS[POS_FIELDS.PIPES]> = {
  [X in keyof T]: IRExtractPipe<NonNullable<T>[X]>;
};

interface IRPoS<T extends IPoS = IPoS> {
  state: T[POS_FIELDS.STATE];
  pipes: IRExtractPipes<T[POS_FIELDS.PIPES]>;
}

interface IRPoSs {
  [X: string]: IRPoS;
}

type IPoSBuilder<T> = (dispatch: IDispatch) => T;

type IRPoSBuilder<T extends any = any, K extends IPoS<T> = IPoS> = (
  name: string,
  rootState: IRootState,
  dispatch: IDispatch,
  updateState: IUpdateState<T>
) => IRPoS<K>;

interface IRPoSBuilders {
  [X: string]: IRPoSBuilder;
}

const pipeCore = () => {};

const pipeDone = <T>(state: T) => state;

const pipeFail = <T>(state: T) => state;

function createUpdateAction<T>(
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

function parsePipe<T, K extends NonNullable<IPoS[POS_FIELDS.PIPES]>[string]>(
  pipe: K,
  rootState: IRootState,
  updateState: IUpdateState<T>,
  piceOfStateName: string,
  pipeName: string
): IRExtractPipe<K> {
  const core = pipe.core || pipeCore;
  const done = pipe.done || pipeDone;
  const fail = pipe.fail || pipeFail;

  function pushAction(state: T, payload: IPayload, actionName: string) {
    const action = createUpdateAction(
      state,
      payload,
      piceOfStateName,
      pipeName,
      actionName
    );
    updateState(action);
  }

  return function (payload: IPayload) {
    const statePoS = rootState[piceOfStateName];
    const statePush = pipe.push(statePoS, payload, rootState);
    pushAction(statePush, payload, PIPE_ACTIONS.PUSH);

    try {
      const data = core(statePush, payload, rootState);
      const stateDone = done(statePush, data, payload, rootState);
      pushAction(stateDone, payload, PIPE_ACTIONS.DONE);
    } catch (err) {
      const stateFail = fail(statePush, err, payload, rootState);
      pushAction(stateFail, payload, PIPE_ACTIONS.FAIL);
    }
  } as IRExtractPipe<K>;
}

function parsePipes<T, K extends NonNullable<IPoS[POS_FIELDS.PIPES]>>(
  pipes: K,
  rootState: IRootState,
  updateState: IUpdateState<T>,
  piceOfStateName: string
): IRExtractPipes<K> {
  return Object.keys(pipes).reduce(
    (acc, pipeName) => ({
      ...acc,
      [pipeName]: parsePipe(
        pipes[pipeName],
        rootState,
        updateState,
        piceOfStateName,
        pipeName
      )
    }),
    {} as IRExtractPipes<K>
  );
}

function createPiceOfStore<T, K extends IPoS<T>>(
  builder: IPoSBuilder<K>
): IRPoSBuilder<T, K> {
  return function (
    name: string,
    rootState: IRootState,
    dispatch: IDispatch,
    updateState: IUpdateState<T>
  ) {
    const { pipes = {}, state } = builder(dispatch);

    return {
      state,
      pipes: parsePipes(pipes, rootState, updateState, name)
    };
  };
}

type IStatirMiddleware = (
  next: (action: IAction) => void
) => (action: IAction) => void;

type IStatirCreateStore<T extends IRPoSBuilders> = (
  config: IStatirConfig<T>
) => IStatirStore<IExtractStoreState<T>, IExtractStoreDispatch<T>>;

type IStatirUpgrade<T extends IRPoSBuilders> = (
  next: IStatirCreateStore<T>
) => IStatirCreateStore<T>;

interface IStatirConfig<T extends IRPoSBuilders> {
  pices: T;
  middlewares?: IStatirMiddleware[];
  upgrades?: IStatirUpgrade<T>[];
}

type IStoreListner<T> = (rootState: T) => void;

interface IStatirStore<T extends any = any, K extends any = any> {
  state: T;
  dispatch: K;
  listners: IStoreListner<T>[];
  addListner(listner: IStoreListner<T>): void;
}

type IExtractStoreState<T extends IRPoSBuilders> = {
  [X in keyof T]: ReturnType<T[X]>[POS_FIELDS.STATE];
};

type IExtractStoreDispatch<T extends IRPoSBuilders> = {
  [X in keyof T]: ReturnType<T[X]>[POS_FIELDS.PIPES];
};

function createBlankStore<T>(initState: T): IStatirStore<T> {
  return {
    state: initState,
    dispatch: {},
    listners: [],
    addListner(listner: IStoreListner<T>) {
      this.listners.push(listner);
    }
  };
}

function extractState<T extends IRPoSBuilders>(
  pices: T
): IExtractStoreState<T> {
  return Object.keys(pices).reduce(
    (acc, key) => ({
      ...acc,
      [key]: pices[key](key, {}, {}, () => {}).state
    }),
    {} as IExtractStoreState<T>
  );
}

function createUpdaterStateTail<T>(state: T, listners: IStoreListner<T>[]) {
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

function createUpdaterState<T>(
  state: T,
  listners: IStoreListner<T>[],
  middlewares: IStatirMiddleware[] = []
) {
  const updaterTail = createUpdaterStateTail(state, listners);
  const updater = middlewares.reduce((acc, next) => next(acc), updaterTail);
  return updater;
}

function extractPices<T>(
  state: T,
  dispatch: IDispatch,
  updateState: IUpdateState,
  pices: IRPoSBuilders
) {
  return Object.keys(pices).reduce(
    (acc, key) => ({
      ...acc,
      [key]: pices[key](key, state, dispatch, updateState)
    }),
    {}
  );
}

function updateDispatcher(pices: IRPoSs, dispatch: IDispatch) {
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

function initStore<T extends IRPoSBuilders>(
  config: IStatirConfig<T>
): IStatirStore<IExtractStoreState<T>, IExtractStoreDispatch<T>> {
  const initState = extractState(config.pices);
  const store = createBlankStore(initState);

  const updaterState = createUpdaterState(
    store.state,
    store.listners,
    config.middlewares
  );

  const pices = extractPices(
    store.state,
    store.dispatch,
    updaterState,
    config.pices
  );

  updateDispatcher(pices, store.dispatch);
  return store;
}

function createStore<T extends IRPoSBuilders>(
  config: IStatirConfig<T>
): IStatirStore<IExtractStoreState<T>, IExtractStoreDispatch<T>> {
  const upgrades = config.upgrades || [];
  const upgradeTail: IStatirCreateStore<T> = initStore;
  const upgradedInitStore = upgrades.reduce(
    (acc, next) => next(acc),
    upgradeTail
  );

  return upgradedInitStore(config);
}

interface IState {
  count: number;
}

const initState: IState = {
  count: 0
};

const piceOfStore = createPiceOfStore(() => ({
  state: initState,
  pipes: {
    increment: {
      push(state: IState) {
        return {
          ...state,
          count: state.count + 1
        };
      },
      core(state: IState) {
        return state;
      },
      done(state) {
        return state;
      },
      fail(state) {
        return state;
      }
    }
  }
}));

function testMiddlewares(next: (action: IAction) => void) {
  return function (action: IAction) {
    next(action);
  };
}

function testUpgrade<T extends IRPoSBuilders>(next: IStatirCreateStore<T>) {
  return function (config: IStatirConfig<T>) {
    const store = next(config);

    if (window && window.__REDUX_DEVTOOLS_EXTENSION__) {
      const devtools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
      devtools.init(store.state);
      devtools.send('asasd', { test: 1 });
    }

    return store;
  };
}

const store = createStore({
  pices: {
    piceOfStore
  },
  middlewares: [testMiddlewares],
  upgrades: [testUpgrade]
});

store.dispatch.piceOfStore.increment();
