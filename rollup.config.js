import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import pkg from './package.json';

export default {
	input: 'src/index.ts',
	output: [
		{ file: pkg.main, format: 'umd', name: 'estreeWalker' },
		{ file: pkg.module, format: 'esm' }
	],
	plugins: [
		resolve({
			extensions: ['.ts']
		}),
		typescript({
			tsconfigOverride: {
				compilerOptions: {
					declaration: false
				}
			}
		})
	]
};
