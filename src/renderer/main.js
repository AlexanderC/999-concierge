import Vue from 'vue';
import axios from 'axios';
import { BootstrapVue, IconsPlugin, TablePlugin } from 'bootstrap-vue';
import Notify from 'vue2-notify';
import VueGlobalVar from 'vue-global-var';
import VueRecomputed from 'vue-recomputed';
import VueInterval from 'vue-interval/dist/VueInterval.common';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import App from './App';
import router from './router';
import store from './store';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));

Vue.http = Vue.prototype.$http = axios.create();
Vue.config.productionTip = false;

Vue.use(VueRecomputed);
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(TablePlugin);
Vue.use(Notify, { position: 'bottom-full' });
Vue.use(VueGlobalVar, {
  globals: {
    runtime: {
      loading: 0,
    },
    settings: {
      accounts: {},
    },
  },
});

Vue.mixin(VueInterval);
Vue.mixin({
  computed: {
    isLoading() {
      return this.runtime.loading > 0;
    },
    hasAccounts() {
      return Object.keys(this.settings.accounts).length > 0;
    },
    accounts() {
      return this.settings.accounts;
    },
    accountsNames() {
      return Object.keys(this.settings.accounts);
    },
  },
  methods: {
    route(...args) {
      router.push(...args);
    },
    link(link) {
      this.$electron.shell.openExternal(link);
    },
    warning(message) {
      this.$root.$notify.warning(message);
    },
    error(message) {
      this.$root.$notify.error(message);
    },
    info(message) {
      this.$root.$notify.info(message);
    },
    success(message) {
      this.$root.$notify.success(message);
    },
    async rpc(method, url, payload = {}) {
      this.runtime.loading += 1;
      const verb = method.toLowerCase();
      const uri = `http://localhost:9081/${url.replace(/^\/+/, '')}`;

      try {
        console.info('Call %s:%s', verb.toUpperCase(), uri, payload);
        const { data: response } = await axios[verb](uri, payload);
        console.info('Response %s:%s', verb.toUpperCase(), uri, response);

        if (response.error) {
          throw new Error(response.message);
        }

        return response.data;
      } catch (e) {
        console.error('Error %s:%s', verb.toUpperCase(), uri, e);
        this.error(e.message);
        return null;
      } finally {
        setTimeout(() => {
          this.runtime.loading -= 1;
        }, 500);
      }
    },
    async loadSettings() {
      const settings = await this.rpc('get', '/settings');

      if (settings) {
        this.settings.accounts = settings.accounts
          && typeof settings.accounts === 'object'
          ? settings.accounts : {};
      }
    },
    async saveSettings(settings) {
      if (await this.rpc('post', '/settings', settings)) {
        this.settings = settings;
        this.success('Настройки сохранены.');
      }
    },
  },
});

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');
