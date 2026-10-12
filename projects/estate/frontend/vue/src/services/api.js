import axios from 'axios';

const REST = 'http://localhost:3000/api';
const GRAPHQL = 'http://localhost:3000/graphql';
const RUBY = 'http://localhost:8082/api';

export async function graphql(query) {
  const res = await axios.post(GRAPHQL, { query });
  return res.data;
}

export async function fetchProperties() {
  const res = await axios.get(`${REST}/properties`);
  return res.data;
}

export async function fetchRubyReviews() {
  const res = await axios.get(`${RUBY}/reviews`);
  return res.data;
}

export async function rubyMarketStats() {
  const res = await axios.get(`${RUBY}/market-stats`);
  return res.data;
}

export async function graphqlListings() {
  const res = await graphql(`{
    listings { id title price views status description location { city } }
  }`);
  return res.data.listings || [];
}