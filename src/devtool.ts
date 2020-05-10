import {
  IAction,
  IRPoSBuilders,
  IStatirCreateStore,
  IStatirConfig
} from './types';

function formateReduxDevtoolsActionName({
  piceOfStore,
  pipe,
  action
}: IAction): string {
  return `${piceOfStore}/${pipe}:${action}`;
}

function createReduxDevtoolsMiddleware(
  devtools: IReduxDevtoolsExtenstionInstance
) {
  return function (next: (action: IAction) => void) {
    return function (action: IAction) {
      const actionName = formateReduxDevtoolsActionName(action);
      devtools.send(actionName, action.state);
      next(action);
    };
  };
}

export function reduxDevtoolsUpgrade<T extends IRPoSBuilders>(
  createStore: IStatirCreateStore<T>
) {
  return function (config: IStatirConfig<T>) {
    if (window && window.__REDUX_DEVTOOLS_EXTENSION__) {
      const devtools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
      const middleware = createReduxDevtoolsMiddleware(devtools);

      const nextConfig: IStatirConfig<T> = {
        ...config,
        middlewares: [...(config.middlewares || []), middleware]
      };

      const upgradedStore = createStore(nextConfig);
      devtools.init(upgradedStore.state);
      return upgradedStore;
    }

    return createStore(config);
  };
}
