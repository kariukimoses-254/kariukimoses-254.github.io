import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import Properties from './pages/Properties.vue';
import Reviews from './pages/Reviews.vue';

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/properties', component: Properties },
    { path: '/reviews', component: Reviews },
  ],
});