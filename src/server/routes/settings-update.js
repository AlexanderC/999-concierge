export default {
  verb: 'POST',
  path: '/settings',
  async handler(req) {
    this.store.set('settings', req.body);

    return this.store.get('settings', {});
  },
};
