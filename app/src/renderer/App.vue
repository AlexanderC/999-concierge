<template>
  <div id="app">
    <b-container fluid>
      <b-navbar sticky="true" variant="faded" type="light">
        <b-navbar-brand href="#">
          <img id="logo" src="~@/assets/logo.png" class="d-inline-block align-top" alt="999.md">
        </b-navbar-brand>

        <b-navbar-nav>
          <b-nav-item-dropdown v-if="hasAccounts" text="Пользователи">
            <b-dropdown-item v-for="account in accountsNames" @click="route(`/account/${account}`)">
              {{ account }}
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>

        <b-nav-text v-if="isLoading" class="ml-auto d-flex align-items-center">
          <strong>Загрузка...</strong>
          <b-spinner class="ml-auto" type="grow" variant="primary"></b-spinner>
        </b-nav-text>
      </b-navbar>
      <b-container fluid class="align-items-center">
        <router-view></router-view>
      </b-container>
    </b-container>
  </div>
</template>

<script>
  export default {
    name: 'concierge',
  };
</script>

<style>
 #app {
   margin: 0;
   padding: 0;
   width: 100%;
   height: 100%;
 }

 #logo {
   height: 50px;
 }
</style>
