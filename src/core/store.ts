import {
  IAction,
  IDispatch,
  IPushAction,
  IRPoSBuilders,
  IStatirStore,
  IStoreListner,
  IExtractStoreState,
  IStatirMiddleware,
  IRPoSs,
  IExtractStoreDispatch,
  IStatirConfig,
  IStatirCreateStore,
  IStatirUpgrade
} from '../typing';
import { warning } from '../utils';
import { reduxDevtoolsUpgrade } from '../devtool';
import { createPiceOfStore } from './piceOfStore';

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
      [key]: {
        ...pices[key].pipes,
        ...pices[key].actions
      }
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
