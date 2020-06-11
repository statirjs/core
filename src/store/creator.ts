import * as S from '../typing/internal';
import { reduxDevtoolsUpgrade } from '../upgrades/devtool';
import { initerForme, INITER_FORME } from '../formes/initer';
import { warning } from '../utils/warning';

const COUNTER_INIT = 0;

const COUNTER_INCREMENT = 1;

export function extractState<T extends S.ReFormeBuilders>(
  formes: T
): S.RootState {
  return Object.keys(formes).reduce(
    (acc, next) => ({
      ...acc,
      [next]: formes[next].state
    }),
    {}
  );
}

export function createBlankStore<T extends S.RootState>(rootState: T): S.Store {
  return {
    state: rootState,
    dispatch: {},
    listeners: [],
    counter: COUNTER_INIT,
    subscribe(listener: S.Listener<T>) {
      this.listeners.push(listener);
    }
  };
}

export function updateDispatch<T extends S.ReFormeBuilders>(
  formes: T,
  store: S.Store,
  updateState: S.UpdateState
) {
  const dispatch = Object.keys(formes).reduce((acc, next) => {
    const { actions, pipes } = formes[next].getForme(
      store.state,
      store.dispatch,
      updateState,
      next
    );

    return {
      ...acc,
      [next]: {
        ...actions,
        ...pipes
      }
    };
  }, {});

  Object.assign(store.dispatch, dispatch);
}

export function createMiddlewareTail(store: S.Store): S.UpdateState {
  return function ({ state, rootState, formeName }: S.Update) {
    const nextState = {
      ...store.state,
      ...rootState,
      [formeName]: state
    };

    Object.assign(store.state, nextState);

    store.counter += COUNTER_INCREMENT;
    store.listeners.forEach((listener) => listener(nextState));
  };
}

export function applyMiddlewares(
  middlewares: S.Middlewares = [],
  store: S.Store
): S.UpdateState {
  const middlewareTail = createMiddlewareTail(store);
  return middlewares.reduce((acc, next) => next(acc), middlewareTail);
}

export function upgradeTail<T extends S.ReFormeBuilders>(
  config: S.Config<T>
): S.Store {
  const rootState = extractState(config.formes);
  const store = createBlankStore(rootState);
  const updateState = applyMiddlewares(config.middlewares, store);
  updateDispatch(config.formes, store, updateState);
  return store;
}

export function applyUpgrades(upgrades: S.Upgrades = []): S.CreateStore {
  const baseUpgrades = [reduxDevtoolsUpgrade, ...upgrades];
  return baseUpgrades.reduce((acc, next) => next(acc), upgradeTail);
}

export function mergeIniter<T extends S.ReFormeBuilders>(
  config: S.Config<T>
): S.Config<T> {
  return {
    ...config,
    formes: {
      ...config.formes,
      [INITER_FORME]: initerForme
    }
  };
}

export function initStore<T extends S.ReFormeBuilders>(
  initConfig: S.Config<T>
): S.Store {
  warning([[typeof initConfig.formes !== 'object', 'Formes must be a object']]);

  const config = mergeIniter(initConfig);
  const createStore = applyUpgrades(config.upgrades);
  const store = createStore(config);
  return store;
}
