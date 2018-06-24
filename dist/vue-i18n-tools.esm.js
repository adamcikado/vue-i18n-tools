/*!
  * vue-i18n-tools v0.1.6
  * (c) 2018 Andrej Adamcik
  * @license MIT
  */
var install = function(Vue) {
	/* istanbul ignore if */
	if (install.installed) {
		if (process.env.NODE_ENV !== 'production') {
			console.warn('already installed.');
		}
		return;
	}
	
	install.installed = true;

	Vue.mixin({
		beforeCreate: function beforeCreate() {
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
		beforeDestroy: function beforeDestroy() {
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
		get: function get() {
			return this._i18n;
		}
	});
	
	Vue.prototype.$t = function(text, values) {
		return this._i18n.translate(text, values);
	};
};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var sprintf = createCommonjsModule(function (module, exports) {
/* global window, exports, define */

!function() {

    var re = {
        not_string: /[^s]/,
        not_bool: /[^t]/,
        not_type: /[^T]/,
        not_primitive: /[^v]/,
        number: /[diefg]/,
        numeric_arg: /[bcdiefguxX]/,
        json: /[j]/,
        not_json: /[^j]/,
        text: /^[^\x25]+/,
        modulo: /^\x25{2}/,
        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/,
        key: /^([a-z_][a-z_\d]*)/i,
        key_access: /^\.([a-z_][a-z_\d]*)/i,
        index_access: /^\[(\d+)\]/,
        sign: /^[\+\-]/
    };

    function sprintf(key) {
        // `arguments` is not an array, but should be fine for this call
        return sprintf_format(sprintf_parse(key), arguments)
    }

    function vsprintf(fmt, argv) {
        return sprintf.apply(null, [fmt].concat(argv || []))
    }

    function sprintf_format(parse_tree, argv) {
        var cursor = 1, tree_length = parse_tree.length, arg, output = '', i, k, match, pad, pad_character, pad_length, is_positive, sign;
        for (i = 0; i < tree_length; i++) {
            if (typeof parse_tree[i] === 'string') {
                output += parse_tree[i];
            }
            else if (Array.isArray(parse_tree[i])) {
                match = parse_tree[i]; // convenience purposes only
                if (match[2]) { // keyword argument
                    arg = argv[cursor];
                    for (k = 0; k < match[2].length; k++) {
                        if (!arg.hasOwnProperty(match[2][k])) {
                            throw new Error(sprintf('[sprintf] property "%s" does not exist', match[2][k]))
                        }
                        arg = arg[match[2][k]];
                    }
                }
                else if (match[1]) { // positional argument (explicit)
                    arg = argv[match[1]];
                }
                else { // positional argument (implicit)
                    arg = argv[cursor++];
                }

                if (re.not_type.test(match[8]) && re.not_primitive.test(match[8]) && arg instanceof Function) {
                    arg = arg();
                }

                if (re.numeric_arg.test(match[8]) && (typeof arg !== 'number' && isNaN(arg))) {
                    throw new TypeError(sprintf('[sprintf] expecting number but found %T', arg))
                }

                if (re.number.test(match[8])) {
                    is_positive = arg >= 0;
                }

                switch (match[8]) {
                    case 'b':
                        arg = parseInt(arg, 10).toString(2);
                        break
                    case 'c':
                        arg = String.fromCharCode(parseInt(arg, 10));
                        break
                    case 'd':
                    case 'i':
                        arg = parseInt(arg, 10);
                        break
                    case 'j':
                        arg = JSON.stringify(arg, null, match[6] ? parseInt(match[6]) : 0);
                        break
                    case 'e':
                        arg = match[7] ? parseFloat(arg).toExponential(match[7]) : parseFloat(arg).toExponential();
                        break
                    case 'f':
                        arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg);
                        break
                    case 'g':
                        arg = match[7] ? String(Number(arg.toPrecision(match[7]))) : parseFloat(arg);
                        break
                    case 'o':
                        arg = (parseInt(arg, 10) >>> 0).toString(8);
                        break
                    case 's':
                        arg = String(arg);
                        arg = (match[7] ? arg.substring(0, match[7]) : arg);
                        break
                    case 't':
                        arg = String(!!arg);
                        arg = (match[7] ? arg.substring(0, match[7]) : arg);
                        break
                    case 'T':
                        arg = Object.prototype.toString.call(arg).slice(8, -1).toLowerCase();
                        arg = (match[7] ? arg.substring(0, match[7]) : arg);
                        break
                    case 'u':
                        arg = parseInt(arg, 10) >>> 0;
                        break
                    case 'v':
                        arg = arg.valueOf();
                        arg = (match[7] ? arg.substring(0, match[7]) : arg);
                        break
                    case 'x':
                        arg = (parseInt(arg, 10) >>> 0).toString(16);
                        break
                    case 'X':
                        arg = (parseInt(arg, 10) >>> 0).toString(16).toUpperCase();
                        break
                }
                if (re.json.test(match[8])) {
                    output += arg;
                }
                else {
                    if (re.number.test(match[8]) && (!is_positive || match[3])) {
                        sign = is_positive ? '+' : '-';
                        arg = arg.toString().replace(re.sign, '');
                    }
                    else {
                        sign = '';
                    }
                    pad_character = match[4] ? match[4] === '0' ? '0' : match[4].charAt(1) : ' ';
                    pad_length = match[6] - (sign + arg).length;
                    pad = match[6] ? (pad_length > 0 ? pad_character.repeat(pad_length) : '') : '';
                    output += match[5] ? sign + arg + pad : (pad_character === '0' ? sign + pad + arg : pad + sign + arg);
                }
            }
        }
        return output
    }

    var sprintf_cache = Object.create(null);

    function sprintf_parse(fmt) {
        if (sprintf_cache[fmt]) {
            return sprintf_cache[fmt]
        }

        var _fmt = fmt, match, parse_tree = [], arg_names = 0;
        while (_fmt) {
            if ((match = re.text.exec(_fmt)) !== null) {
                parse_tree.push(match[0]);
            }
            else if ((match = re.modulo.exec(_fmt)) !== null) {
                parse_tree.push('%');
            }
            else if ((match = re.placeholder.exec(_fmt)) !== null) {
                if (match[2]) {
                    arg_names |= 1;
                    var field_list = [], replacement_field = match[2], field_match = [];
                    if ((field_match = re.key.exec(replacement_field)) !== null) {
                        field_list.push(field_match[1]);
                        while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                            if ((field_match = re.key_access.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1]);
                            }
                            else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1]);
                            }
                            else {
                                throw new SyntaxError('[sprintf] failed to parse named argument key')
                            }
                        }
                    }
                    else {
                        throw new SyntaxError('[sprintf] failed to parse named argument key')
                    }
                    match[2] = field_list;
                }
                else {
                    arg_names |= 2;
                }
                if (arg_names === 3) {
                    throw new Error('[sprintf] mixing positional and named placeholders is not (yet) supported')
                }
                parse_tree.push(match);
            }
            else {
                throw new SyntaxError('[sprintf] unexpected placeholder')
            }
            _fmt = _fmt.substring(match[0].length);
        }
        return sprintf_cache[fmt] = parse_tree
    }

    /**
     * export to either browser or node.js
     */
    /* eslint-disable quote-props */
    {
        exports['sprintf'] = sprintf;
        exports['vsprintf'] = vsprintf;
    }
    if (typeof window !== 'undefined') {
        window['sprintf'] = sprintf;
        window['vsprintf'] = vsprintf;

        if (typeof undefined === 'function' && undefined['amd']) {
            undefined(function() {
                return {
                    'sprintf': sprintf,
                    'vsprintf': vsprintf
                }
            });
        }
    }
    /* eslint-enable quote-props */
}();
});

var vsprintf = sprintf.vsprintf;


var Locale = function Locale(name, data) {
	this.locale = name;
	this.plural = data.plural || [1, null];
	this.translations = data.translations || {};
};

var I18n = function I18n(options) {
	var this$1 = this;

	options = options || {};
		
	this.locale = options.locale || null;
	this.locales = {};
	this._dataListeners = [];
	this._translateListeners = [];
	this.resourceUrl = options.resourceUrl || null;
		
	var locales = options.locales || {};
	for (var locale in locales) {
		this$1.addLocale(locale, locales[locale], true);
	}
};
	
I18n.prototype.hasLocale = function hasLocale (name) {
	return this.locales.hasOwnProperty(name);
};
	
I18n.prototype.addLocale = function addLocale (name, data, silent) {
		if ( silent === void 0 ) silent = false;

	if (this.locales[name]) {
		return;
	}
		
	this.locales[name] = new Locale(name, data);
		
	!silent && this.locale === name && this.updateUI();
};
	
I18n.prototype.removeLocale = function removeLocale (name) {
	delete this.locales[name];
		
	this.locale === name && this.updateUI();
};
	
I18n.prototype.loadLocale = function loadLocale (name) {
		var this$1 = this;

	return new Promise(function (resolve, reject) {
		if (!this$1.resourceUrl) {
			throw new Error(("Could not set locale \"" + name + "\", because it's no data and resource url is not set."));
		}

		return fetch(this$1.resourceUrl + '/' + name + '.json')
	}).then(function (resource) {
		return resource.json();
	}).then(function (data) {
		this$1.addLocale(name, data);
	});
};
	
I18n.prototype.setLocale = function setLocale (name) {
		var this$1 = this;

	if (this.locale === name) {
		return Promise.resolve();
	}

	if (this.hasLocale(name)) {
		this.locale = name;
		this.updateUI();
			
		return Promise.resolve();
	}

	return this.loadLocale(name).then(function () {
		this$1.locale = name;
		this$1.updateUI();
	});
};
	
I18n.prototype.getTranslation = function getTranslation (key, locale) {
		if ( locale === void 0 ) locale = this.locale;

	if (!this.locales[locale]) {
		return;
	}

	var parts = key.split('.');
		
	var part;
	var translation = this.locales[locale].translations;
	while (translation && (part = parts.shift())) {
		translation = translation[part];
	}
		
	return translation;
};
	
I18n.prototype.getTranslationVariant = function getTranslationVariant (translation, count, locale) {
		if ( locale === void 0 ) locale = this.locale;

	var plural = this.locales[locale].plural;
	var variant = -1;
		
	for (var i = 0; i < plural.length; i++) {
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
};
	
I18n.prototype.translate = function translate (text, values) {
		var this$1 = this;

	var key = text;
	var isTranslated = false;
	var translation = this.getTranslation(text);
		
	if (typeof translation === 'string') {
		text = translation;
		isTranslated = true;
	} else if (Array.isArray(translation) && translation.length && typeof values === 'number') {
		var variant = this.getTranslationVariant(translation, values);
			
		if (variant) {
			text = variant;
			isTranslated = true;
		}
	}
		
	values = typeof values === 'number' ? [values] : values || [];

	for (var i = 0; i < this._translateListeners.length; i++) {
		this$1._translateListeners[i](key, isTranslated);
	}
		
	return vsprintf(text, values);
};
	
I18n.prototype.subscribeData = function subscribeData (vm) {
	this._dataListeners.push(vm);
};
	
I18n.prototype.unsubscribeData = function unsubscribeData (vm) {
	var index = this._dataListeners.indexOf(vm);
	index !== -1 && this._dataListeners.splice(index, 1);
};

I18n.prototype.subscribeTranslate = function subscribeTranslate (handler) {
	this._translateListeners.push(handler);
};

I18n.prototype.unsubscribeTranslate = function unsubscribeTranslate (handler) {
	var index = this._translateListeners.indexOf(handler);
	index !== -1 && this._translateListeners.splice(index, 1);
};
	
I18n.prototype.updateUI = function updateUI () {
		var this$1 = this;

	var i = this._dataListeners.length;
	while (i--) {
		this$1._dataListeners[i].$nextTick(function() {
			this.$forceUpdate();
		});
	}
};

I18n.install = install;

if (typeof window !== 'undefined' && window.Vue) {
	window.Vue.use(I18n);
}


I18n.version = '0.1.6';
I18n.install = install;

export default I18n;
