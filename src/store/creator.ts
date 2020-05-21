import * as S from '../typing/internal';
import { reduxDevtoolsUpgrade } from '../upgrades/devtool';
import { warning } from '../utils/warning';

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

// Parse Upgrades

export function upgradeTail<T extends S.ReFormeBuilders>(
  config: S.Config<T>
): S.Store {
  const rootState = extractState(config.forms);
  const store = createBlankStore(rootState);
  const updateState = applyMiddlewares(
    config.middlewares,
    rootState,
    store.listeners
  );
  updateDispatch(config.forms, store, updateState);
  return store;
}

export function applyUpgrades(upgrades: S.Upgrades = []): S.CreateStore {
  const baseUpgrades = [reduxDevtoolsUpgrade, ...upgrades];
  return baseUpgrades.reduce((acc, next) => next(acc), upgradeTail);
}

// Init Store

export function initStore<T extends S.ReFormeBuilders>(
  config: S.Config<T>
): S.Store {
  warning([[typeof config.forms !== 'object', 'Forms must be a object']]);

  const createStore = applyUpgrades(config.upgrades);
  return createStore(config);
}
