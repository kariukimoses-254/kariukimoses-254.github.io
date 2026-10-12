import axios from 'axios';

const REST_API = 'http://localhost:3000/api';
const GRAPHQL_API = 'http://localhost:3000/graphql';
const PHP_API = 'http://localhost:8081/api';
const JAVA_API = 'http://localhost:8080/api';
const RUBY_API = 'http://localhost:8082/api';

async function graphql(query) {
  const res = await axios.post(GRAPHQL_API, { query });
  if (res.data.errors) throw new Error(res.data.errors[0].message);
  return res.data.data;
}

export const api = {
  // Node.js REST (PostgreSQL)
  getProperties: async (params = {}) => {
    const res = await axios.get(`${REST_API}/properties`, { params });
    return res.data;
  },
  getProperty: async (id) => {
    const res = await axios.get(`${REST_API}/properties/${id}`);
    return res.data;
  },
  createProperty: async (property) => {
    const res = await axios.post(`${REST_API}/properties`, property);
    return res.data;
  },

  // Node.js REST (MongoDB)
  getListings: async (params = {}) => {
    const res = await axios.get(`${REST_API}/listings`, { params });
    return res.data;
  },
  registerListingView: async (id) => {
    const res = await axios.post(`${REST_API}/listings/visit/${id}`);
    return res.data;
  },

  // GraphQL (Node.js)
  graphqlListings: async () => {
    return graphql(`{
      listings {
        id title price description views status
        location { city country }
      }
    }`);
  },
  graphqlProperties: async () => {
    return graphql(`{
      properties {
        id title price location type status bedrooms
        agent { name email }
      }
    }`);
  },

  // Java REST (MySQL)
  javaListings: async () => {
    const res = await axios.get(`${JAVA_API}/listings`);
    return res.data;
  },

  // PHP REST
  phpProperties: async () => {
    const res = await axios.get(`${PHP_API}/properties`);
    return res.data;
  },
  phpGraphQL: async (query) => {
    const res = await axios.post(`${PHP_API}/graphql`, { query });
    return res.data;
  },

  // Ruby REST
  rubyReviews: async () => {
    const res = await axios.get(`${RUBY_API}/reviews`);
    return res.data;
  },
  rubyMarketStats: async () => {
    const res = await axios.get(`${RUBY_API}/market-stats`);
    return res.data;
  },
};