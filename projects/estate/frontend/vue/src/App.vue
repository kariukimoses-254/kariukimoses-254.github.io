<script setup>
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-brand-800">
    <div class="container">
      <router-link class="navbar-brand fw-bold" to="/">
        EstateHub <span class="badge bg-success ms-2">Vue 3</span>
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#vueNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="vueNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/properties">Properties</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/reviews">Ruby Reviews</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <router-view />
</template>

<style>
.bg-brand-800 { background-color: #124a7a; }
</style>