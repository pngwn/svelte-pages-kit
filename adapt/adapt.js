import { join } from 'path';

export function copy(from, to, filter = () => true) {
	if (!fs.existsSync(from)) return [];
	if (!filter(path.basename(from))) return [];

	const files = [];
	const stats = fs.statSync(from);

	if (stats.isDirectory()) {
		fs.readdirSync(from).forEach((file) => {
			files.push(...copy(path.join(from, file), path.join(to, file)));
		});
	} else {
		mkdirp(path.dirname(to));
		fs.copyFileSync(from, to);
		files.push(to);
	}

	return files;
}

export function cf_pages() {
	return {
		name: 'cloudflare-pages-adapter',
		adapt({ utils, config }) {
			console.log(utils, config, config.kit.files);
			const files = utils.copy(
				config.kit.files.assets,
				join(process.cwd(), '.svelte-kit', 'cf-pages')
			);
			console.log(files);
		}
	};
}
