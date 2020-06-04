import * as S from '../typing/internal';

export function formateReduxDevtoolsActionName({
  formeName,
  actionName
}: S.Update): string {
  return `${formeName}/${actionName}`;
}

export function mergeRootState(update: S.Update) {
  const rootState = update?.rootState || {};
  const state = update?.state || {};
  const formeName = update?.formeName || '';
  return {
    ...rootState,
    ...{ [formeName]: state }
  };
}

export function createReduxDevtoolsMiddleware(
  devtools: ReduxDevtoolsExtenstionInstance
): S.Middleware {
  return function (next: S.UpdateState): S.UpdateState {
    return function (update: S.Update) {
      const actionName = formateReduxDevtoolsActionName(update);
      const nextStoreState = mergeRootState(update);
      devtools.send(actionName, nextStoreState);
      next(update);
    };
  };
}

export function reduxDevtoolsUpgrade(next: S.CreateStore): S.CreateStore {
  return function (config: S.Config) {
    if (window && window.__REDUX_DEVTOOLS_EXTENSION__) {
      const devtools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
      const middleware = createReduxDevtoolsMiddleware(devtools);

      const nextConfig: S.Config = {
        ...config,
        middlewares: [...(config.middlewares || []), middleware]
      };

      const store = next(nextConfig);
      devtools.init(store.state);
      return store;
    }

    return next(config);
  };
}
