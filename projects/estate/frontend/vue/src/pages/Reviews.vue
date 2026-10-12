<script setup>
import { onMounted, ref } from 'vue';
import { fetchRubyReviews } from '../services/api';

const reviews = ref([]);
const error = ref('');

onMounted(async () => {
  try {
    reviews.value = await fetchRubyReviews();
  } catch (e) {
    error.value = e.message;
  }
});
</script>

<template>
  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="display-6 mb-0">Client Reviews</h1>
      <span class="badge bg-danger fs-6">Ruby Sinatra API</span>
    </div>

    <div class="alert alert-danger" v-if="error">{{ error }}</div>

    <div class="row g-4">
      <div class="col-md-6 col-lg-4" v-for="r in reviews" :key="r.id">
        <div class="card h-100 shadow-sm border-0">
          <div class="card-body">
            <div class="d-flex justify-content-between mb-2">
              <h6 class="mb-0">{{ r.reviewer_name }}</h6>
              <span class="text-warning">
                <span v-for="n in 5" :key="n" :class="n <= r.rating ? 'text-warning' : 'text-muted'">&#9733;</span>
              </span>
            </div>
            <p class="text-muted small">Property #{{ r.property_id }} &middot; {{ new Date(r.created_at).toLocaleDateString() }}</p>
            <blockquote class="blockquote small mb-0">"{{ r.comment }}"</blockquote>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>