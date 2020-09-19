<template>
  <b-row align-h="center">
    <b-button :disabled="isLoading" @click="processAds()" variant="link">
      <b-icon :animation="isLoading ? 'spin' : null" icon="arrow-clockwise" variant="dark"></b-icon>
      Обновить
    </b-button>

    <b-table striped hover
      :items="items"
      :fields="headline"
      sort-by="watch"
      sort-desc="true">
      <template v-slot:cell(watch)="row">
        <b-spinner @click="unwatch(row.item.id)" v-if="row.item.watch" variant="success" type="grow"></b-spinner>
        <b-form-checkbox @change="watch(row.item.id)" v-else>Вкл.</b-form-checkbox>
      </template>
      <template v-slot:cell(account)="data">
        <a href="#" @click="route(`/account/${data.value}`)">{{ data.value }}</a>
      </template>
      <template v-slot:cell(id)="data">
        <a href="#" @click.prevent="link(`https://999.md/ru/${data.value}`)">{{ data.value }}</a>
      </template>
      <template v-slot:cell(category)="data">
        <a href="#" @click.prevent="link(`https://999.md/ru/list/${data.value.path}`)">{{ data.value.name }}</a>
      </template>
    </b-table>
  </b-row>
</template>

<script>
  /* eslint-disable no-continue */
  /* eslint-disable no-restricted-syntax */
  export default {
    name: 'dashboard',
    components: {},
    data() {
      return {
        headline: [
          { key: 'id', label: 'ID' },
          { key: 'watch', label: 'Авто-топ' },
          { key: 'account', label: 'Пользователь' },
          { key: 'title', label: 'Название' },
          { key: 'category', label: 'Категория' },
          {
            key: 'date',
            label: 'Обновлено',
            formatter: value => new Date(value).toLocaleString(),
          },
          {
            key: 'state',
            label: 'Статус',
            formatter: (value) => {
              switch (value) {
                case 'public':
                  return 'Опубликовано';
                case 'blocked':
                case 'blocked_commercial':
                  return 'Заблокировано';
                case 'hidden':
                  return 'Скрыто';
                case 'expired':
                  return 'Просрочено';
                case 'need_pay':
                  return 'Не оплачено';
                default: return value;
              }
            },
          },
          { key: 'views', label: 'Просмотры' },
          {
            key: 'position',
            label: 'Позиция',
            formatter: value => value || '-',
          },
        ],
        listing: {},
        idAccount: {},
        positions: {},
        republished: {},
      };
    },
    recomputed: {
      items() {
        const items = [];

        for (const account of this.accountsNames) {
          if (!this.listing[account]) {
            continue;
          }

          const settings = this.settings.accounts[account];

          for (const {
            id,
            republished,
            posted,
            categories: { subcategory: { title: categoryName, url: categoryPath } },
            views_counter: views,
            title,
            state,
          } of this.listing[account]) {
            const dateRemote = republished || posted;
            const dateLocal = this.republished[id];

            items.push({
              date: (!dateLocal || dateRemote > dateLocal) ? dateRemote : dateLocal,
              watch: (settings.ads || []).includes(id),
              position: this.positions[id] || null,
              id,
              account,
              title,
              category: { name: categoryName, path: categoryPath },
              state,
              views,
            });
          }
        }

        return items;
      },
    },
    async mounted() {
      await this.loadSettings();

      if (!this.hasAccounts) {
        this.route('/initialize');
      }

      await this.processAds();
    },
    methods: {
      async INTERVAL__6e4$tick() { // run every 60 seconds
        await this.processAds();
      },
      async processAds(skipRepublish = false) {
        await Promise.all(this.accountsNames.map(async account =>
          this.processAdsAccount(account, skipRepublish)));
      },
      async processAdsAccount(account, skipRepublish = false) {
        if (!skipRepublish) {
          await this.loadAds(account); // reload ads
        }

        const settings = this.settings.accounts[account];
        const republish = await this.processAccountAdsPositions(account);

        if (!skipRepublish && republish.length > 0) {
          const msg = `Обновляем ${republish.length} объявлени${republish.length > 1 ? 'я' : 'е'}: ${republish.join(', ')}`;
          this.info(msg);
          await this.rpc('post', `/adverts/${settings.token}`, republish);

          for (const id of republish) {
            this.republished[id] = new Date().toISOString();
          }

          setTimeout(async () => { // wait till cache invalidated...
            await this.processAdsAccount(account, true); // skip republishing
          }, 500);
        }
      },
      async processAccountAdsPositions(account) {
        const republish = [];
        const settings = this.settings.accounts[account];
        const ads = settings.ads || [];

        if (ads.length > 0) {
          await this.loadAds(account);
          const positions = await this.rpc('post', `/adverts/positions/${settings.token}`, ads);

          if (positions) {
            for (const id of ads) {
              this.positions[id] = positions[id] || null;

              if (!this.positions[id]) {
                republish.push(id);
              }
            }

            this.$recompute('items');
          }
        }

        return republish;
      },
      async watch(id) {
        const account = this.idAccount[id];
        this.settings.accounts[account].ads = this.settings.accounts[account].ads || [];
        this.settings.accounts[account].ads.push(id);
        await this.saveSettings(this.settings);
        this.$recompute('items');
      },
      async unwatch(id) {
        const account = this.idAccount[id];
        this.settings.accounts[account].ads = (this.settings.accounts[account].ads || [])
          .filter(x => x !== id);
        await this.saveSettings(this.settings);
        this.$recompute('items');
      },
      async loadAds(account) {
        const { token } = this.accounts[account];
        const ads = await this.rpc('get', `/adverts/${token}`);

        const removedAds = await this.invalidateMissingOrHiddenAds(account, ads);

        if ((removedAds || []).length > 0) {
          const msg = `Прекращяем авто-топ ${removedAds.length} скрытых или удалённых объявлений: ${removedAds.join(', ')}`;
          this.warning(msg);
        }

        if ((ads || []).length > 0) {
          for (const ad of ads) {
            this.idAccount[ad.id] = account;
          }
          this.listing[account] = ads;
          this.$recompute('items');
        }
      },
      async invalidateMissingOrHiddenAds(account, ads) {
        const removedAds = [];

        if (!Array.isArray(this.settings.accounts[account].ads)
          || this.settings.accounts[account].ads.length <= 0) {
          return removedAds;
        }

        const existingAds = ads.map(x => x.id);
        const adsToValidate = this.settings.accounts[account].ads;

        for (const id of adsToValidate) {
          if (!existingAds.includes(id)) {
            this.settings.accounts[account].ads = this.settings.accounts[account].ads
              .filter(x => x !== id);
            removedAds.push(id);
          }
        }

        if (removedAds.length > 0) {
          await this.saveSettings(this.settings);
        }

        return removedAds;
      },
    },
  };
</script>

<style>
  /* CSS */
</style>
