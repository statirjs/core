import * as S from '../typing/internal';
import { warning } from '../utils/warning';

export function createFormeFactory(plugins: S.Plugin[]): S.ReFactory {
  warning([[typeof plugins !== 'object', 'Plugins must be a array']]);

  return function (customForme: S.CustomForme): S.ReFormeBuilder {
    return plugins.reduce((acc, next) => next(acc), customForme);
  };
}
