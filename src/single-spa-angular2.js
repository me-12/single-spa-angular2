const defaultOpts = {
	// required opts
	domElementGetter: null,
	angularPlatform: null,
	mainModule: null,
	template: null,
	// optional opts
	Router: null,
};

export default function singleSpaAngular2(userOpts) {
	if (typeof userOpts !== 'object') {
		throw new Error(`single-spa-angular2 requires a configuration object`);
	}

	const opts = {
		...defaultOpts,
		...userOpts,
	};

	if (typeof opts.domElementGetter !== 'function') {
		throw new Error(`single-spa-angular2 must be passed opts.domElementGetter function`);
	}

	if (!opts.angularPlatform) {
		throw new Error(`single-spa-angular2 must be passed opts.angularPlatform. Usually this should be the return value of platformBrowserDynamic()`);
	}

	if (!opts.mainModule) {
		throw new Error(`single-spa-angular2 must be passed opts.mainModule, which is the Angular module to bootstrap`);
	}

	if (typeof opts.template !== 'string') {
		throw new Error(`single-spa-angular2 must be passed opts.template string`);
	}

	return {
		bootstrap: bootstrap.bind(null, opts),
		mount: mount.bind(null, opts),
		unmount: unmount.bind(null, opts),
	};
}

function bootstrap(opts) {
	return Promise.resolve();
}

function mount(opts) {
	const containerEl = getContainerEl(opts);
	containerEl.innerHTML = opts.template;
	return opts
		.angularPlatform
		.bootstrapModule(opts.mainModule)
		.then(module => {
			return opts.bootstrappedModule = module;
		})
}

function unmount(opts) {
	return new Promise((resolve, reject) => {
		if (opts.Router) {
			const routerRef = opts.bootstrappedModule.injector.get(opts.Router);
			routerRef.dispose();
		}
		opts.bootstrappedModule.destroy();
		delete opts.bootstrappedModule;
		resolve();
	});
}

function getContainerEl(opts) {
	const element = opts.domElementGetter();
	if (!element) {
		throw new Error(`domElementGetter did not return a valid dom element`);
	}

	return element;
}
