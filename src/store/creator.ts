import * as S from '../typing/internal';
import { reduxDevtoolsUpgrade } from '../upgrades/devtool';

// Create Store

export function extractState<T extends S.ReFormeBuilders>(
  forms: T
): S.RootState {
  return Object.keys(forms).reduce(
    (acc, next) => ({
      ...acc,
      [next]: forms[next].state
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
  forms: T,
  store: S.Store,
  updateState: S.UpdateState
) {
  const dispatch = Object.keys(forms).reduce((acc, next) => {
    const { actions, pipes } = forms[next].getForme(
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

// Parse Middlewares

export function createMiddlewareTail<T extends S.RootState>(
  rootState: T
): S.UpdateState {
  return function ({ state, formeName }: S.Update) {
    const nextState = {
      ...rootState,
      [formeName]: state
    };

    Object.assign(rootState, nextState);
  };
}

export function applyMiddlewares<T extends S.RootState>(
  middlewares: S.Middlewares = [],
  rootState: T
): S.UpdateState {
  const middlewareTail = createMiddlewareTail(rootState);
  return middlewares.reduce((acc, next) => next(acc), middlewareTail);
}

// Parse Upgrades

export function upgradeTail<T extends S.ReFormeBuilders>(
  config: S.Config<T>
): S.Store {
  const rootState = extractState(config.forms);
  const updateState = applyMiddlewares(config.middlewares, rootState);
  const store = createBlankStore(rootState);
  updateDispatch(config.forms, store, updateState);
  return store;
}

export function applyUpgrades(upgrades: S.Upgrades = []): S.CreateStore {
  const defaultUpgrades = [reduxDevtoolsUpgrade, ...upgrades];
  return defaultUpgrades.reduce((acc, next) => next(acc), upgradeTail);
}

// Init Store

export function initStore<T extends S.ReFormeBuilders>(
  config: S.Config<T>
): S.Store {
  const createStore = applyUpgrades(config.upgrades);
  return createStore(config);
}
