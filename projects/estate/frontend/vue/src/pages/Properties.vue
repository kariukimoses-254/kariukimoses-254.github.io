<script setup>
import { onMounted, ref } from 'vue';
import { fetchProperties, graphqlListings } from '../services/api';

const properties = ref([]);
const listings = ref([]);
const error = ref('');
const source = ref('postgres');

onMounted(async () => {
  try {
    const data = await fetchProperties();
    properties.value = (data.properties || []).map((p) => ({ ...p, _src: 'PostgreSQL (REST)' }));
    listings.value = await graphqlListings();
  } catch (e) {
    error.value = e.message;
  }
});
</script>

<template>
  <div class="container py-5">
    <h1 class="display-6 mb-4">Property & Listing Explorer</h1>

    <div class="alert alert-danger" v-if="error">{{ error }}</div>

    <div class="row mb-4">
      <div class="col-12">
        <h5 class="mb-3">PostgreSQL Properties <span class="text-muted small">(Node REST)</span></h5>
      </div>
      <div class="col-md-6 col-lg-4 mb-4" v-for="p in properties" :key="p.id">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <span class="badge bg-primary mb-2">{{ p._src }}</span>
            <h5 class="card-title">{{ p.title }}</h5>
            <p class="text-muted small">{{ p.location }}</p>
            <div class="d-flex justify-content-between">
              <span class="h5 text-brand-600">${{ Number(p.price).toLocaleString() }}</span>
              <span class="badge" :class="p.status === 'available' ? 'bg-success' : 'bg-warning'">{{ p.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <hr />

    <h5 class="my-4">MongoDB Listings <span class="text-muted small">(Node GraphQL)</span></h5>
    <div class="row g-4 mb-4">
      <div class="col-md-4" v-for="l in listings" :key="l._id || l.id">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h6 class="card-title">{{ l.title }}</h6>
            <p class="small text-muted mb-1">{{ l.location?.city || 'N/A' }}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="text-success fw-bold">${{ l.price.toLocaleString() }}</span>
              <span class="badge bg-info text-dark">{{ l.views }} views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-brand-600 { color: #1e7fd0; }
</style>