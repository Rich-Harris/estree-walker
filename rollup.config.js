import sucrase from 'rollup-plugin-sucrase';
import pkg from './package.json';

function emitModulePackageFile() {
  return {
    name: 'emit-module-package-file',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'package.json',
        source: `{"type":"module"}`
      });
    }
  };
}

export default {
	input: 'src/index.ts',
	output: [
		{ file: pkg.main, format: 'umd', name: 'estreeWalker' },
		{ file: pkg.module, format: 'esm', plugins: [emitModulePackageFile] }
	],
	plugins: [
		sucrase({
			transforms: ['typescript']
		})
	]
};
