export default {
  client: true,
  verb: 'POST',
  path: '/adverts',
  async handler(req, _res, client) {
    const ids = Array.from(req.body);
    const responses = await Promise.all(ids.map(id => client.post(`/adverts/${id}/republish`)));
    return responses.map(({ data }) => data);
  },
};
