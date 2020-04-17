import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.ts',
  output: {
    file: 'build/index.js'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
      extensions: ['.js', '.ts']
    })
  ]
};
