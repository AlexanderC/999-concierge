import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: require('@/components/Dashboard').default,
    },
    {
      path: '/initialize',
      name: 'initialize',
      component: require('@/components/Initialize').default,
    },
    {
      path: '/account/:name',
      name: 'account',
      component: require('@/components/Initialize').default,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
