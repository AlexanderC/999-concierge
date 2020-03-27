export default {
  client: true,
  verb: 'GET',
  path: '/account',
  async handler(_req, _res, client) {
    const { data } = await client.get('/phone_numbers?lang=ru');

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data;
  },
};
