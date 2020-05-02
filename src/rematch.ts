import { createModel, init } from '@rematch/core';

const test = createModel({
  state: {
    test: 1
  },
  reducers: {
    pushTest(state: { test: number }, payload: number) {
      return {
        test: payload
      };
    },
    testTest(state) {
      return state;
    }
  }
});

const store = init({
  models: {
    test
  }
});

store.dispatch.test.pushTest(123);
