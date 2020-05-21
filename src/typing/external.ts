import * as S from './internal';

export declare function createForme<T extends S.State, K extends S.Forme<T>>(
  formeState: T,
  builder?: S.FormeBuilder<K>
): S.ReFormeBuilder<T, K>;

export declare function initStore<T extends S.ReFormeBuilders>(
  config: S.Config<T>
): S.Store<T>;

export declare function createFormeFactory(plugins: S.Plugin[]): S.ReFactory;
