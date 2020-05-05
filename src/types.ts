declare global {
  interface IReduxDevtoolsExtenstionInstance {
    init(state: any): void;
    send(name: string, state: any): void;
  }

  interface IReduxDevtoolsExtenstion {
    connect(config?: any): IReduxDevtoolsExtenstionInstance;
  }

  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: IReduxDevtoolsExtenstion;
  }
}

export type IDispatch = {
  [X: string]: any;
};

export type IRootState = {
  [X: string]: any;
};

export type IPayload = any;

export interface IAction<T extends any = any> {
  piceOfStore: string;
  pipe: string;
  action: string;
  payload: IPayload;
  state: T;
}

export type IUpdateState<T extends any = any> = (action: IAction<T>) => void;

export interface IPoSPipe<T extends any = any, K = any> {
  push(state: T, payload: IPayload, rootState: IRootState): T;
  core?(state: T, payload: IPayload, rootState: IRootState): Promise<K> | K;
  done?(state: T, data: K, payload: IPayload, rootState: IRootState): T;
  fail?(state: T, error: Error, payload: IPayload, rootState: IRootState): T;
}

export enum PIPE_ACTIONS {
  PUSH = 'push',
  CORE = 'core',
  DONE = 'done',
  FAIL = 'fail'
}

export enum POS_FIELDS {
  NAME = 'name',
  STATE = 'state',
  PIPES = 'pipes'
}

export type IPoSPipes<T, K extends string = string> = {
  [X in K]: IPoSPipe<T>;
};

export interface IPoS<T extends any = any> {
  state: T;
  pipes?: IPoSPipes<T>;
}

export type IRExtractPushPayload<
  T extends IPoSPipe
> = T[PIPE_ACTIONS.PUSH] extends () => void
  ? null
  : T[PIPE_ACTIONS.PUSH] extends (state: infer S) => infer S
  ? null
  : T[PIPE_ACTIONS.PUSH] extends (state: infer S, payload: infer K) => infer S
  ? K
  : null;

export type IRExtractCorePayload<
  T extends IPoSPipe
> = T[PIPE_ACTIONS.CORE] extends () => void
  ? null
  : T[PIPE_ACTIONS.CORE] extends (state: infer S) => infer P
  ? null
  : T[PIPE_ACTIONS.CORE] extends (state: infer S, payload: infer K) => infer P
  ? K
  : null;

export type IRExtractDonePayload<
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

export type IRExtractFailPayload<
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

export type IRExtractPayload<T extends IPoSPipe> = NonNullable<
  | IRExtractPushPayload<T>
  | IRExtractCorePayload<T>
  | IRExtractDonePayload<T>
  | IRExtractFailPayload<T>
>;

export type IRExtractPipe<
  T extends NonNullable<IPoS[POS_FIELDS.PIPES]>[string],
  K = IRExtractPayload<T>
> = [K] extends [void] ? () => void : (payload: K) => void;

export type IRExtractPipes<T extends IPoS[POS_FIELDS.PIPES]> = {
  [X in keyof T]: IRExtractPipe<NonNullable<T>[X]>;
};

export interface IRPoS<T extends IPoS = IPoS> {
  state: T[POS_FIELDS.STATE];
  pipes: IRExtractPipes<T[POS_FIELDS.PIPES]>;
}

export interface IRPoSs {
  [X: string]: IRPoS;
}

export type IPoSBuilder<T> = (dispatch: IDispatch) => T;

export type IRPoSBuilder<T extends any = any, K extends IPoS<T> = IPoS> = (
  name: string,
  rootState: IRootState,
  dispatch: IDispatch,
  updateState: IUpdateState<T>
) => IRPoS<K>;

export interface IRPoSBuilders {
  [X: string]: IRPoSBuilder;
}

export type IStatirMiddleware = (
  next: (action: IAction) => void
) => (action: IAction) => void;

export type IStatirCreateStore<T extends IRPoSBuilders> = (
  config: IStatirConfig<T>
) => IStatirStore<IExtractStoreState<T>, IExtractStoreDispatch<T>>;

export type IStatirUpgrade<T extends IRPoSBuilders> = (
  next: IStatirCreateStore<T>
) => IStatirCreateStore<T>;

export interface IStatirConfig<T extends IRPoSBuilders> {
  pices: T;
  middlewares?: IStatirMiddleware[];
  upgrades?: IStatirUpgrade<T>[];
}

export type IStoreListner<T> = (rootState: T) => void;

export interface IStatirStore<T extends any = any, K extends any = any> {
  state: T;
  dispatch: K;
  listners: IStoreListner<T>[];
  addListner(listner: IStoreListner<T>): void;
}

export type IExtractStoreState<T extends IRPoSBuilders> = {
  [X in keyof T]: ReturnType<T[X]>[POS_FIELDS.STATE];
};

export type IExtractStoreDispatch<T extends IRPoSBuilders> = {
  [X in keyof T]: ReturnType<T[X]>[POS_FIELDS.PIPES];
};
