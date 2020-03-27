/* eslint-disable function-paren-newline */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
export default {
  client: true,
  verb: 'POST',
  path: '/adverts/positions',
  async handler(req, _res, client) {
    const ids = Array.from(req.body);
    const { data } = await client.get('/adverts?page_size=100&page=1&states=public&lang=ru');

    if (data.error) {
      throw new Error(data.error.message);
    }

    const adverts = data.adverts.filter(a => ids.includes(a.id));

    if (adverts.length !== ids.length) {
      throw new Error('Не найдено одно или несколько объявлений из списка.');
    }

    const positions = {};
    const categories = [...new Set(adverts.map(a => a.categories.subcategory.url))];

    for (const id of ids) {
      positions[id] = null;
    }

    for (const path of categories) {
      const page = await this.browser.newPage();

      page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36');
      await page.goto(`https://999.md/ru/list/${path}?view_type=short&page=1`);

      const itemsList = await page.$$('#js-ads-container > table > tbody > tr');

      const items = await Promise.all(itemsList
        .map(item => item.$eval(
          'td.ads-list-table-title > div > h3 > a',
          a => a.href.replace('https://999.md/ru/', '').trim(),
        )),
      );

      for (const id of ids) {
        const idx = items.indexOf(id);

        if (idx !== -1) {
          positions[id] = idx + 1;
        }
      }

      await page.close();
    }

    return positions;
  },
};
