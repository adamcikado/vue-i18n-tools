# vue-i18n-tools


[![npm](https://img.shields.io/npm/v/vue-i18n-tools.svg)
![npm](https://img.shields.io/npm/dm/vue-i18n-tools.svg)](https://www.npmjs.com/package/vue-i18n-tools)
[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)
[![license](https://img.shields.io/npm/l/express.svg)]()


## Installation

```bash
npm install --save vue-i18n-tools
```

## Getting Started
HTML
```html
<script src="https://unpkg.com/vue/dist/vue.js"></script>
<script src="https://unpkg.com/vue-i18n/dist/vue-i18n.js"></script>

<div id="app">
  <p>{{ $t("Hello World!") }}</p>
</div>
```

JavaScript
```javascript
import VueI18nTools from 'vue-i18n-tools';

Vue.use(VueI18nTools);

const locales = {
	sk: {
		translations: {
			'Hello World!': 'Ahoj Svet!'
		}
	},
	de: {
		translations: {
			'Hello World!': 'Hallo Welt!'
		}
	}
};

const i18n = new VueI18nTools({
	locale: 'sk',
	locales
});

new Vue({
	i18n
}).$mount('#app');
```


## Todo
- custom resource load function to avoid polyfills for fetch
- docs
- server translate API


---

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2018 Andrej Adamcik