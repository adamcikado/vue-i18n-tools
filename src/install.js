const install = function(Vue) {
	/* istanbul ignore if */
	if (install.installed) {
		if (process.env.NODE_ENV !== 'production') {
			console.warn('already installed.');
		}
		return;
	}
	
	install.installed = true;

	Vue.mixin({
		beforeCreate() {
			if (this.$options.i18n) {
				this._i18n = this.$options.i18n;
				this._i18n.subscribeData(this);
				this._i18nSubscribing = true;
			} else if (this.$root && this.$root.$i18n) {
				this._i18n = this.$root.$i18n;
				this._i18n.subscribeData(this);
				this._i18nSubscribing = true;
			}
		},
		beforeDestroy() {
			if (!this._i18n) {
				return;
			}
			
			if (this._i18nSubscribing) {
				this._i18n.unsubscribeData(this);
				delete this._i18nSubscribing;
			}

			delete this._i18n;
		}
	});
	
	Object.defineProperty(Vue.prototype, '$i18n', {
		get() {
			return this._i18n;
		}
	});
	
	Vue.prototype.$t = function(text, values) {
		return this._i18n.translate(text, values);
	};
};

export { install };