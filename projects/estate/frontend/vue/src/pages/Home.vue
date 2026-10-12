<script setup>
import { onMounted, ref } from 'vue';
import { rubyMarketStats } from '../services/api';

const stats = ref(null);
const error = ref('');

onMounted(async () => {
  try {
    stats.value = await rubyMarketStats();
  } catch (e) {
    error.value = e.message;
  }
});
</script>

<template>
  <header class="text-white py-5" style="background: linear-gradient(135deg, #0d2955, #3b9df6)">
    <div class="container">
      <span class="badge bg-warning text-dark mb-3">Vue 3 + Bootstrap + Tailwind + jQuery</span>
      <h1 class="display-4 fw-bold">EstateHub</h1>
      <p class="lead">
        Vue frontend connecting to all backends: Java, PHP, Ruby, and Node.js.
      </p>
    </div>
  </header>

  <section class="container py-5">
    <div class="card shadow-sm mb-4" v-if="stats">
      <div class="card-header bg-dark text-white">Live Market Stats <span class="badge bg-danger ms-2">Ruby Sinatra</span></div>
      <div class="card-body">
        <div class="row text-center">
          <div class="col">
            <div class="h3">${{ stats.average_price.toLocaleString() }}</div>
            <div class="text-muted small">Average Price</div>
          </div>
          <div class="col">
            <div class="h3">{{ stats.total_listings }}</div>
            <div class="text-muted small">Total Listings</div>
          </div>
          <div class="col">
            <div class="h3">{{ stats.growth_rate }}%</div>
            <div class="text-muted small">YoY Growth</div>
          </div>
          <div class="col">
            <div class="small">
              <span class="badge bg-info text-dark me-1" v-for="city in stats.trending_cities" :key="city">{{ city }}</span>
            </div>
            <div class="text-muted small">Trending</div>
          </div>
        </div>
      </div>
    </div>

    <div class="alert alert-danger" v-if="error">{{ error }}</div>
    <div class="text-muted text-center" v-else-if="!stats">
      <div class="spinner-border text-primary"></div>
    </div>
  </section>
</template>