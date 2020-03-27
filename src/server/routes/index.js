import settingsGet from './settings-get';
import settingsUpdate from './settings-update';
import advertsList from './adverts-list';
import account from './account';
import advertsPositions from './adverts-positions';
import advertsRepublish from './adverts-republish';

const METHODS = [
  settingsGet,
  settingsUpdate,
  account,
  advertsList,
  advertsPositions,
  advertsRepublish,
];

export default async (server) => {
  // eslint-disable-next-line no-restricted-syntax
  for (let {
    verb,
    path,
    // eslint-disable-next-line prefer-const
    handler,
    // eslint-disable-next-line prefer-const
    client,
  } of METHODS) {
    verb = verb.toLowerCase();
    if (client) {
      path = `${path}/:token`;
    }

    server.app[verb](path, async (req, res) => {
      try {
        const args = [server, req, res];

        if (client) {
          args.push(server.client(req.params.token));
        }
        console.info('Dispatching %s:%s', req.method, req.path, req.body || 'N/A');
        const data = await handler.call(...args);
        console.info('Respond %s:%s', req.method, req.path, data);
        return res.send({
          error: false,
          data,
        });
      } catch (e) {
        console.warn('Error %s:%s', req.method, req.path, e.message);
        return res.send(JSON.stringify({
          error: true,
          message: e.message,
        }));
      }
    });
  }
};
