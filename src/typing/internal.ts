// Global types

declare global {
  interface ReduxDevtoolsExtenstionInstance {
    init(state: any): void;
    send(name: string, state: any): void;
  }

  interface ReduxDevtoolsExtenstion {
    connect(config?: any): ReduxDevtoolsExtenstionInstance;
  }

  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: ReduxDevtoolsExtenstion;
  }
}

// Common types

export type State = any;
export type Payload = any;
export type RootState = any;
export type Dispatch = any;
export type Data = any;

export enum ReFormeBuilderFields {
  State = 'state',
  GetForme = 'getForme'
}

export enum FormeFields {
  State = 'state',
  Actions = 'actions',
  Pipes = 'pipes'
}

export enum PipeSteps {
  Push = 'push',
  Core = 'core',
  Done = 'done',
  Fail = 'fail'
}

export interface Update<T extends State = State> {
  state: T;
  rootState: RootState;
  formeName: string;
  actionName: string;
}

export type UpdateState<T extends State = State> = (update: Update<T>) => void;

// Forme types

export interface Pipe<T extends State = State> {
  push(state: T, payload: Payload): T;
  core?(state: T, payload: Payload): Data;
  done?(state: T, payload: Payload, data: Data): T;
  fail?(state: T, payload: Payload, error: Error): T;
}

export type Pipes<T extends State = State> = Record<string, Pipe<T>>;

export type Action<T extends State = State> = (state: T, payload: Payload) => T;

export type Actions<T extends State = State> = Record<string, Action<T>>;

export interface Forme<T extends State = State> {
  actions?: Actions<T>;
  pipes?: Pipes<T>;
}

export type FormeBuilder<T extends Forme = Forme> = (dispatch: Dispatch) => T;

export type RePipe = (payload?: Payload) => void;

export type RePipes = Record<string, RePipe>;

export type ReAction = (payload?: Payload) => void;

export type ReActions = Record<string, ReAction>;

export type ExtractPush<T extends Pipe> = T[PipeSteps.Push] extends () => void
  ? null
  : T[PipeSteps.Push] extends (state: infer S) => infer S
  ? null
  : T[PipeSteps.Push] extends (state: infer S, payload: infer K) => infer S
  ? K
  : null;

export type ExtractCore<T extends Pipe> = T[PipeSteps.Core] extends () => void
  ? null
  : T[PipeSteps.Core] extends (state: infer S) => infer P
  ? null
  : T[PipeSteps.Core] extends (state: infer S, payload: infer K) => infer P
  ? K
  : null;

export type ExtractDone<T extends Pipe> = T[PipeSteps.Done] extends () => void
  ? null
  : T[PipeSteps.Done] extends (state: infer S) => infer S
  ? null
  : T[PipeSteps.Done] extends (state: infer S, payload: infer P) => infer S
  ? P
  : T[PipeSteps.Done] extends (
      state: infer S,
      payload: infer P,
      data: infer K
    ) => infer S
  ? P
  : null;

export type ExtractFail<T extends Pipe> = T[PipeSteps.Fail] extends () => void
  ? null
  : T[PipeSteps.Fail] extends (state: infer S) => infer S
  ? null
  : T[PipeSteps.Fail] extends (state: infer S, payload: infer P) => infer S
  ? P
  : T[PipeSteps.Fail] extends (
      state: infer S,
      payload: infer P,
      error: infer K
    ) => infer S
  ? P
  : null;

export type ExtractPipePayload<T extends Pipe> = NonNullable<
  ExtractPush<T> | ExtractCore<T> | ExtractDone<T> | ExtractFail<T>
>;

export type ExtractPipe<T extends Pipe = Pipe, K = ExtractPipePayload<T>> = [
  K
] extends [void]
  ? () => void
  : (payload: K) => void;

export type ExtractPipes<T extends Pipes = Pipes> = {
  [X in keyof T]: ExtractPipe<T[X]>;
};

export type ExtractActionPayload<
  T extends Action = Action
> = T extends () => void
  ? null
  : T extends (state: infer S) => infer S
  ? null
  : T extends (state: infer S, payload: infer K) => infer S
  ? K
  : null;

export type ExtractAction<
  T extends Action = Action,
  K = NonNullable<ExtractActionPayload<T>>
> = [K] extends [void] ? () => void : (payload: K) => void;

export type ExtractActions<T extends Actions = Actions> = {
  [X in keyof T]: ExtractAction<T[X]>;
};

export interface ReForme<T extends Forme = Forme> {
  actions: ExtractActions<NonNullable<T[FormeFields.Actions]>>;
  pipes: ExtractPipes<NonNullable<T[FormeFields.Pipes]>>;
}

export interface ReFormeBuilder<
  T extends State = State,
  K extends Forme<T> = Forme
> {
  state: T;
  getForme(
    rootState: RootState,
    dispatch: Dispatch,
    updateState: UpdateState,
    formeName: string
  ): ReForme<K>;
}

export type ReFormeBuilders = Record<string, ReFormeBuilder>;

// Store types

export type Middleware<T extends State = State> = (
  next: UpdateState<T>
) => UpdateState<T>;

export type Middlewares = Middleware[];

export type CreateStore<T extends ReFormeBuilders = ReFormeBuilders> = (
  config: Config<T>
) => Store<T>;

export type Upgrade<T extends ReFormeBuilders = ReFormeBuilders> = (
  next: CreateStore<T>
) => CreateStore<T>;

export type Upgrades = Upgrade[];

export interface Config<T extends ReFormeBuilders = ReFormeBuilders> {
  forms: T;
  upgrades?: Upgrades;
  middlewares?: Middlewares;
}

export type ExtractRootState<T extends ReFormeBuilders = ReFormeBuilders> = {
  [X in keyof T]: T[X][FormeFields.State];
};

export type ExtractDispatch<T extends ReFormeBuilders = ReFormeBuilders> = {
  [X in keyof T]: ReturnType<
    T[X][ReFormeBuilderFields.GetForme]
  >[FormeFields.Pipes] &
    ReturnType<T[X][ReFormeBuilderFields.GetForme]>[FormeFields.Actions];
};

export type Listener<T extends RootState = RootState> = (rootState: T) => void;

export type Listeners = Listener[];

export interface Store<
  T extends ReFormeBuilders = ReFormeBuilders,
  K = ExtractRootState<T>
> {
  state: K;
  dispatch: ExtractDispatch<T>;
  listeners: Listeners;
  subscribe(listener: Listener<K>): void;
}
