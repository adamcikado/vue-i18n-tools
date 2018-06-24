import { install } from './install';
import sprintf from 'sprintf-js';
const vsprintf = sprintf.vsprintf;


class Locale {
	constructor(name, data) {
		this.locale = name;
		this.plural = data.plural || [1, null];
		this.translations = data.translations || {};
	}
}

class I18n {
	constructor(options) {
		options = options || {};
		
		this.locale = options.locale || null;
		this.locales = {};
		this._dataListeners = [];
		this._translateListeners = [];
		this.resourceUrl = options.resourceUrl || null;
		
		const locales = options.locales || {};
		for (let locale in locales) {
			this.addLocale(locale, locales[locale], true);
		}
	}
	
	hasLocale(name) {
		return this.locales.hasOwnProperty(name);
	}
	
	addLocale(name, data, silent = false) {
		if (this.locales[name]) {
			return;
		}
		
		this.locales[name] = new Locale(name, data);
		
		!silent && this.locale === name && this.updateUI();
	}
	
	removeLocale(name) {
		delete this.locales[name];
		
		this.locale === name && this.updateUI();
	}
	
	loadLocale(name) {
		return new Promise((resolve, reject) => {
			if (!this.resourceUrl) {
				throw new Error(`Could not set locale "${name}", because it's no data and resource url is not set.`);
			}

			return fetch(this.resourceUrl + '/' + name + '.json')
		}).then(resource => {
			return resource.json();
		}).then(data => {
			this.addLocale(name, data);
		});
	}
	
	setLocale(name) {
		if (this.locale === name) {
			return Promise.resolve();
		}

		if (this.hasLocale(name)) {
			this.locale = name;
			this.updateUI();
			
			return Promise.resolve();
		}

		return this.loadLocale(name).then(() => {
			this.locale = name;
			this.updateUI();
		});
	}
	
	getTranslation(key, locale = this.locale) {
		if (!this.locales[locale]) {
			return;
		}

		const parts = key.split('.');
		
		let part;
		let translation = this.locales[locale].translations;
		while (translation && (part = parts.shift())) {
			translation = translation[part];
		}
		
		return translation;
	}
	
	getTranslationVariant(translation, count, locale = this.locale) {
		const plural = this.locales[locale].plural;
		let variant = -1;
		
		for (let i = 0; i < plural.length; i++) {
			if (typeof plural[i] === 'number' && count === plural[i]) {
				variant = i;
				break;
			} else if (Array.isArray(plural[i]) && count >= plural[i][0] && count <= plural[i][1]) {
				variant = i;
				break;
			} else if (plural[i] === null) {
				variant = i;
			}
		}
		
		return translation[variant];
	}
	
	translate(text, values) {
		const key = text;
		let isTranslated = false;
		let translation = this.getTranslation(text);
		
		if (typeof translation === 'string') {
			text = translation;
			isTranslated = true;
		} else if (Array.isArray(translation) && translation.length && typeof values === 'number') {
			const variant = this.getTranslationVariant(translation, values);
			
			if (variant) {
				text = variant;
				isTranslated = true;
			}
		}
		
		values = typeof values === 'number' ? [values] : values || [];

		for (let i = 0; i < this._translateListeners.length; i++) {
			this._translateListeners[i](key, isTranslated);
		}
		
		return vsprintf(text, values);
	}
	
	subscribeData(vm) {
		this._dataListeners.push(vm);
	}
	
	unsubscribeData(vm) {
		const index = this._dataListeners.indexOf(vm);
		index !== -1 && this._dataListeners.splice(index, 1);
	}

	subscribeTranslate(handler) {
		this._translateListeners.push(handler);
	}

	unsubscribeTranslate(handler) {
		const index = this._translateListeners.indexOf(handler);
		index !== -1 && this._translateListeners.splice(index, 1);
	}
	
	updateUI() {
		let i = this._dataListeners.length;
		while (i--) {
			this._dataListeners[i].$nextTick(function() {
				this.$forceUpdate();
			});
		}
	}
}

I18n.install = install;

if (typeof window !== 'undefined' && window.Vue) {
	window.Vue.use(I18n);
}


I18n.version = '__VERSION__';
I18n.install = install;

export default I18n;