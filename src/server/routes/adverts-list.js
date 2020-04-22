export default {
  client: true,
  verb: 'GET',
  path: '/adverts',
  async handler(_req, _res, client) {
    const { data } = await client.get('/adverts?page_size=100&page=1&states=public&lang=ru');

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.adverts;
  },
};
