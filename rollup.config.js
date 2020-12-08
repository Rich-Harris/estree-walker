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
	input: {
		'estree-walker': 'src/index.js'
	},
	output: [
		{ dir: 'dist/umd', format: 'umd', name: 'estreeWalker' },
		{ dir: 'dist/esm', format: 'esm', plugins: [emitModulePackageFile()] }
	]
};
