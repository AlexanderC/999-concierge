<template>
  <b-row align-h="center">
    <b-jumbotron>
      <template v-slot:lead>
        Профиль пользователя 999.md
      </template>
      <hr class="my-4">
      <b-form @submit.prevent="addAccount()">
        <b-form-group
          horizontal
          :label-cols="4"
          description="Имя пользователя"
          label="Пользователь"
        >
          <b-form-input :disabled="edit" label="Пользователь" v-model.trim="name"></b-form-input>
        </b-form-group>

        <b-form-group
          horizontal
          :label-cols="4"
          description="Код со страницы https://999.md/api"
          label="Код"
        >
          <b-form-input v-model.trim="token"></b-form-input>
        </b-form-group>

        <b-button v-if="edit"
          @click.prevent="remove()"
          variant="danger">Удалить</b-button>
        <b-button v-if="edit"
          @click.prevent="route('/dashboard')"
          variant="outline-secondary">Отмена</b-button>
        <b-button type="submit"
          :disabled="!token || !name || !token.trim() || !name.trim()"
          variant="outline-primary">{{ edit ? 'Сохранить' : 'Добавить' }}</b-button>
      </b-form>
    </b-jumbotron>
  </b-row>
</template>

<script>
  export default {
    name: 'initialize',
    components: {},
    data() {
      return {
        token: null,
        name: null,
        edit: false,
      };
    },
    mounted() {
      const { name } = this.$route.params;

      if (name) {
        if (!this.settings.accounts[name]) {
          this.route('/dashboard');
        } else {
          this.edit = true;
          this.name = name;
          this.token = this.settings.accounts[name].token;
        }
      }
    },
    methods: {
      async remove() {
        delete this.settings.accounts[this.name];
        await this.processSettings();
      },
      async addAccount() {
        const { token, name } = this;
        const account = await this.rpc('get', `/account/${token}`);

        if (account) {
          this.settings.accounts[name] = { token, ...account };
          await this.processSettings();
        }
      },
      async processSettings() {
        await this.saveSettings(this.settings);
        this.name = null;
        this.token = null;
        this.route('/dashboard');
      },
    },
  };
</script>

<style>
  /* CSS */
</style>
