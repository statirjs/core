type IDispatch = any;

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

type IPieceOfStoreBuilder<T> = (dispatch: IDispatch) => T;

type IParsedPiceOfStoreSubscribe<T extends any = any> = (state: T) => void;

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

type IExtractWorkLinesStatus<T extends IPieceOfStore['workLines']> = {
  [x in keyof T]: {
    isLoading: boolean;
    isError: boolean;
  };
};

interface IParsedPieceOfStore<T extends IPieceOfStore, K = T['state']> {
  state: K & IExtractWorkLinesStatus<T['workLines']>;
  name: T['name'];
  workLines: IParsedWorkLines<T['workLines']>;
  subscribers: IParsedPiceOfStoreSubscribe<K>[];
  subscribe(subscriber: IParsedPiceOfStoreSubscribe<K>): void;
}

type IParsedPieceOfStoreBuilder<T extends IPieceOfStore = IPieceOfStore> = (
  dispatch: IDispatch
) => IParsedPieceOfStore<T>;

function merge<T, K = any>(target: K[], fn: (acc: T, next: K) => T): T {
  return target.reduce(fn, {} as T);
}

function emit<T>(state: T, subscribers: IParsedPiceOfStoreSubscribe<T>[]) {
  subscribers.forEach((subscriber) => subscriber(state));
}

function workLineDecorator(cb: (...rest: any[]) => any, status: any) {
  return function (...rest: any[]) {
    const result = cb(...rest);
    return {
      ...result,
      ...status
    };
  };
}

function parseWorkLines<T extends NonNullable<IPieceOfStore['workLines']>, K>(
  workLines: T,
  state: K,
  subscribers: IParsedPiceOfStoreSubscribe<K>[]
): IParsedWorkLines<T> {
  const parsedWorkLines = Object.keys(workLines).map((key) => {
    const {
      push = (state) => state,
      core = (state) => state,
      done = (state) => state,
      fail = (state) => state
    } = workLines[key];

    return {
      [key]: (payload: any) => {
        const pushState = workLineDecorator(push, {
          [key]: {
            isLoading: true,
            isError: false
          }
        })(state, payload);
        Object.assign(state, pushState);
        emit(state, subscribers);

        try {
          const coreResult = core(pushState, payload);

          const doneState = workLineDecorator(done, {
            [key]: {
              isLoading: false,
              isError: false
            }
          })(pushState, payload, coreResult);

          Object.assign(state, doneState);
          emit(state, subscribers);
        } catch (err) {
          const failState = workLineDecorator(fail, {
            [key]: {
              isLoading: false,
              isError: true
            }
          })(pushState, payload, err);

          Object.assign(state, failState);
          emit(state, subscribers);
        }
      }
    };
  });

  return merge<IParsedWorkLines<T>>(parsedWorkLines, (acc, next) => ({
    ...acc,
    ...next
  }));
}

function parseState<T, K extends NonNullable<IPieceOfStore['workLines']>>(
  state: T,
  workLines: K
): T & IExtractWorkLinesStatus<K> {
  const statuses: any = Object.keys(workLines)
    .map((key) => ({
      [key]: {
        isLoading: false,
        isError: false
      }
    }))
    .reduce(
      (acc, next) => ({
        ...acc,
        ...next
      }),
      {}
    );

  return {
    ...state,
    ...statuses
  };
}

function createPieceOfStore<T, K extends IPieceOfStore<T>>(
  piceOfStore: IPieceOfStoreBuilder<K>
): IParsedPieceOfStoreBuilder<K> {
  return function (dispatch: IDispatch) {
    const { state, name, workLines = {} } = piceOfStore(dispatch);
    const subscribers: IParsedPiceOfStoreSubscribe<T>[] = [];
    const parsedState = parseState(state, workLines);

    return {
      state: parsedState,
      name,
      subscribers,
      workLines: parseWorkLines(workLines, parsedState, subscribers),
      subscribe(subscriber: IParsedPiceOfStoreSubscribe<T>) {
        this.subscribers.push(subscriber);
      }
    };
  };
}

interface IState {
  testValue: number;
}

const initState: IState = {
  testValue: 1
};

const pieceOfStore = createPieceOfStore(() => ({
  state: initState,
  name: 'testPiceOfStore',
  workLines: {
    test: {
      push(state: IState, payload: number) {
        return {
          ...state,
          testValue: payload
        };
      },
      core(state) {
        return state;
      },
      done(state) {
        return {
          ...state
        };
      },
      fail(state) {
        return {
          ...state
        };
      }
    }
  }
}));

const testPiceOfStore = pieceOfStore(123);

testPiceOfStore.subscribe((state) => console.log(state));

testPiceOfStore.workLines.test(1);

testPiceOfStore.workLines.test(2);
