import { createForme } from '../forme/creator';

export const INITER_FORME = 'initer';

export const INITER_ACTION = 'init';

export const initerForme = createForme({}, () => ({
  actions: {
    init(state) {
      return state;
    }
  }
}));
