import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'build/index.js',
      format: 'cjs'
    },
    plugins: [
      resolve({
        extensions: ['.js', '.ts']
      }),
      babel({
        exclude: 'node_modules/**',
        extensions: ['.js', '.ts']
      })
    ]
  }
];
