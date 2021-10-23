import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

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
		async adapt({ utils, config }) {
			const files = fileURLToPath(new URL('./', import.meta.url));
			const target_dir = join(process.cwd(), '.svelte-kit', 'cf-pages');
			const target_client = join(target_dir, 'client');
			utils.rimraf(target_dir);

			console.log(utils, config, config.kit.files);

			const static_files = utils
				.copy(config.kit.files.assets, target_client)
				.map((f) => f.replace(`${target_client}/`, ''));

			const client_files = utils
				.copy(`${process.cwd()}/.svelte-kit/output/client`, target_client)
				.map((f) => f.replace(`${target_client}/`, ''));

			// returns nothinbg, very sad
			const prerendered = await utils.prerender({
				dest: `${target_client}/`
			});

			const static_assets = [...static_files, ...client_files];
			const assets = `const ASSETS = new Set(${JSON.stringify(static_assets)});\n`;
			const worker = readFileSync(join(files, 'worker.js'), { encoding: 'utf-8' });
			console.log(worker);
			writeFileSync(join(target_dir, 'server.js'), assets + worker);
			console.log(static_files, client_files, prerendered);
		}
	};
}
