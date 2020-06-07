import * as S from '../typing/internal';
import { reduxDevtoolsUpgrade } from '../upgrades/devtool';
import { warning } from '../utils/warning';

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

export function createMiddlewareTail<T extends S.RootState>(
  rootState: T,
  listeners: S.Listener[]
): S.UpdateState {
  return function ({ state, formeName }: S.Update) {
    const nextState = {
      ...rootState,
      [formeName]: state
    };

    Object.assign(rootState, nextState);

    listeners.forEach((listener) => listener(rootState));
  };
}

export function applyMiddlewares<T extends S.RootState>(
  middlewares: S.Middlewares = [],
  rootState: T,
  listeners: S.Listener[]
): S.UpdateState {
  const middlewareTail = createMiddlewareTail(rootState, listeners);
  return middlewares.reduce((acc, next) => next(acc), middlewareTail);
}

export function upgradeTail<T extends S.ReFormeBuilders>(
  config: S.Config<T>
): S.Store {
  const rootState = extractState(config.formes);
  const store = createBlankStore(rootState);
  const updateState = applyMiddlewares(
    config.middlewares,
    rootState,
    store.listeners
  );
  updateDispatch(config.formes, store, updateState);
  return store;
}

export function applyUpgrades(upgrades: S.Upgrades = []): S.CreateStore {
  const baseUpgrades = [reduxDevtoolsUpgrade, ...upgrades];
  return baseUpgrades.reduce((acc, next) => next(acc), upgradeTail);
}

export function initStore<T extends S.ReFormeBuilders>(
  config: S.Config<T>
): S.Store {
  warning([[typeof config.formes !== 'object', 'Formes must be a object']]);

  const createStore = applyUpgrades(config.upgrades);
  return createStore(config);
}
