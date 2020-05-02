interface IWorkLine<T = any, K extends any = any, P extends any = any> {
  push: (state: T, payload: P) => T;
  core?: (state: T, payload: P) => K;
  done?: (state: T, payload: P, data: K) => T;
  fail?: (state: T, payload: P, error: Error) => T;
}

interface IWorkLines<T extends any = any> {
  [x: string]: IWorkLine<T>;
}

interface IPieceOfStore<T extends any = any> {
  state: T;
  name: string;
  workLines?: IWorkLines<T>;
}

type IPieceOfStoreBuilder<T> = (dispatch: any) => T;

type IParsedPiceOfStoreSubscribe<T> = (state: T) => void;

interface IParsedPiceOfStoreSubscribeItem<T> {
  id: string;
  subscriber: IParsedPiceOfStoreSubscribe<T>;
}

type IParsedWorkLine<T extends string, P extends any> = P[T] extends () => void
  ? null
  : P[T] extends (state: infer S) => infer S
  ? null
  : P[T] extends (state: infer S, payload: infer K) => infer S
  ? K
  : null;

type IParseWorkLine<
  T,
  K = NonNullable<
    | IParsedWorkLine<'push', T>
    | IParsedWorkLine<'core', T>
    | IParsedWorkLine<'done', T>
    | IParsedWorkLine<'fail', T>
  >
> = [K] extends [void] ? () => void : (payload: K) => void;

type IParsedWorkLines<T extends IPieceOfStore['workLines']> = {
  [x in keyof T]: IParseWorkLine<T[x]>;
};

interface IParsedPieceOfStore<T extends IPieceOfStore, K = T['state']> {
  state: K;
  name: T['name'];
  workLines: IParsedWorkLines<T['workLines']>;
  subscribers: IParsedPiceOfStoreSubscribeItem<K>[];
  getState(): K;
  subscribe(subscriber: IParsedPiceOfStoreSubscribe<T>): string;
  unsubscribe(id: string): void;
}

type IParsedPieceOfStoreBuilder<T extends IPieceOfStore> = (
  dispatch: any
) => IParsedPieceOfStore<T>;

function createPieceOfStore<T, K extends IPieceOfStore<T>>(
  piceOfStore: IPieceOfStoreBuilder<K>
) {
  return piceOfStore;
}

interface IState {
  test: number;
}

const initState: IState = {
  test: 1
};

const pieceOfStore = createPieceOfStore(() => ({
  asdfsd: 'sdfasd',
  state: initState,
  name: 'testPiceOfStore',
  workLines: {
    test: {
      push(state: IState) {
        return state;
      },
      core(state) {
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

console.log((dispatch: any) => pieceOfStore(dispatch).workLines.test);
