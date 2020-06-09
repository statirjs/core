import * as S from './internal';

export declare function createForme<T extends S.State, K extends S.Forme<T>>(
  formeState: T,
  builder?: S.FormeBuilder<K>
): S.ReFormeBuilder<T, K>;

export declare function initStore<T extends S.ReFormeBuilders>(
  initConfig: S.Config<T>
): S.Store<T>;

export declare const INITER_FORME: string;

export declare const INITER_ACTION: string;
