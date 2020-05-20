import * as S from '../typing/internal';

export function createFormeFactory(plugins: S.Plugin[]): S.ReFactory {
  return function (customForme: S.CustomForme): S.ReFormeBuilder {
    return plugins.reduce((acc, next) => next(acc), customForme);
  };
}
