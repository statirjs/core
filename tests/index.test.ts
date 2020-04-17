import { hello } from '../src';

test('hello test', () => {
  expect(hello()).toEqual('hello world!');
});
