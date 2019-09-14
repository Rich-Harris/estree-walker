const sander = require('sander');
const glob = require('tiny-glob/sync');

for (const file of glob('src/**/*.js')) {
	sander.unlinkSync(file);
}

sander.rimrafSync('types');
for (const file of glob('src/**/*.d.ts')) {
	sander.renameSync(file).to(file.replace(/^src/, 'types'));
}