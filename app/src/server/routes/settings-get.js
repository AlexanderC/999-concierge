export default {
  verb: 'GET',
  path: '/settings',
  async handler() {
    return this.store.get('settings', {});
  },
};
