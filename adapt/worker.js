import { init, render } from '../output/server/app.js';

init();

export default {
	async fetch(req, env) {
		const url = new URL(req.url);

		// check generated asset_set for static files
		if (url.pathname.substring(1).startsWith('assets')) {
			return env.ASSETS.fetch(req);
		}

		try {
			const rendered = await render({
				host: req.host,
				path: req.pathname,
				query: req.searchParams,
				rawBody: await read(req),
				headers: Object.fromEntries(req.headers),
				method: req.method
			});

			if (rendered) {
				return new Response(rendered.body, {
					status: rendered.status,
					headers: makeHeaders(rendered.headers)
				});
			}
		} catch (e) {
			return new Response('Error rendering route:' + (e.message || e.toString()), { status: 500 });
		}

		return new Response({
			status: 404,
			statusText: 'Not Found'
		});
	}
};
