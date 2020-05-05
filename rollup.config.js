import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'build/es/index.js',
      format: 'es'
    },
    plugins: [
      typescript({
        declaration: false
      })
    ]
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'build/es/index.mjs',
      format: 'es'
    },
    plugins: [
      typescript({
        declaration: false
      }),
      terser()
    ]
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'build/cjs/index.js',
      format: 'cjs'
    },
    plugins: [
      typescript({
        declaration: false
      })
    ]
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'build/umd/index.js',
      format: 'umd',
      name: 'statirjs'
    },
    plugins: [
      typescript({
        declaration: false
      })
    ]
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'build/umd/index.min.js',
      format: 'umd',
      name: 'statirjs'
    },
    plugins: [
      typescript({
        declaration: false
      }),
      terser()
    ]
  }
];
