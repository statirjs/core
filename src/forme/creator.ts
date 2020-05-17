import * as S from '../typing/internal';

// Parse Pipes

export function defaultPipeAction<T extends S.State>(state: T): T {
  return state;
}

export function formatePipeActionName(name: string, step: string) {
  return `${name}:${step}`;
}

export function parsePipe<T extends S.Pipe>(
  pipe: T,
  rootState: S.RootState,
  updateState: S.UpdateState,
  formeName: string,
  actionName: string
): S.RePipe {
  const push = pipe.push;
  const core = pipe.core || defaultPipeAction;
  const done = pipe.done || defaultPipeAction;
  const fail = pipe.fail || defaultPipeAction;

  function update(state: S.State, step: string) {
    const name = formatePipeActionName(actionName, step);
    updateState({ state, rootState, formeName, actionName: name });
  }

  return function (payload: S.Payload) {
    const formeState = rootState[formeName];
    const pushState = push(formeState, payload);
    update(pushState, S.PipeSteps.Push);

    try {
      const data = core(pushState, payload);
      const doneState = done(pushState, payload, data);
      update(doneState, S.PipeSteps.Done);
    } catch (err) {
      const failState = fail(pushState, payload, err);
      update(failState, S.PipeSteps.Fail);
    }
  };
}

export function parsePipes<T extends S.Pipes>(
  pipes: T,
  rootState: S.RootState,
  updateState: S.UpdateState,
  formeName: string
): S.RePipes {
  return Object.keys(pipes).reduce(
    (acc, key) => ({
      ...acc,
      [key]: parsePipe(pipes[key], rootState, updateState, formeName, key)
    }),
    {}
  );
}

// Parse Actions

export function parseAction<T extends S.Action>(
  action: T,
  rootState: S.RootState,
  updateState: S.UpdateState,
  formeName: string,
  actionName: string
): S.ReAction {
  return function (payload: S.Payload) {
    const formeState = rootState[formeName];
    const state = action(formeState, payload);
    updateState({ state, rootState, formeName, actionName });
  };
}

export function parseActions<T extends S.Actions>(
  actions: T,
  rootState: S.RootState,
  updateState: S.UpdateState,
  formeName: string
): S.ReActions {
  return Object.keys(actions).reduce(
    (acc, key) => ({
      ...acc,
      [key]: parseAction(actions[key], rootState, updateState, formeName, key)
    }),
    {}
  );
}

// Cerate Forme

export function createForme<T extends S.State, K extends S.Forme<T>>(
  formeState: T,
  builder?: S.FormeBuilder<K>
): S.ReFormeBuilder<T> {
  return {
    state: formeState,
    getForme(
      rootState: S.RootState,
      dispatch: S.Dispatch,
      updateState: S.UpdateState,
      formeName: string
    ): S.ReForme {
      const { actions = {}, pipes = {} } = builder?.(dispatch) || {};

      return {
        actions: parseActions(actions, rootState, updateState, formeName),
        pipes: parsePipes(pipes, rootState, updateState, formeName)
      };
    }
  };
}
