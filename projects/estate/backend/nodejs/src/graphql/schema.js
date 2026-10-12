const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLInputObjectType,
  GraphQLID,
  GraphQLEnumType,
} = require('graphql');
const { Listing } = require('../models/mongo');
const { Property, Agent } = require('../models/postgres');
const { status: dbStatus } = require('../services/db');
const memStore = require('../services/in_memory_store');

const LocationType = new GraphQLObjectType({
  name: 'Location',
  fields: {
    city: { type: GraphQLString },
    state: { type: GraphQLString },
    country: { type: GraphQLString },
    lat: { type: GraphQLFloat },
    lng: { type: GraphQLFloat },
  },
});

const ListingType = new GraphQLObjectType({
  name: 'Listing',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    price: { type: GraphQLFloat },
    location: { type: LocationType },
    features: { type: new GraphQLList(GraphQLString) },
    images: { type: new GraphQLList(GraphQLString) },
    status: { type: GraphQLString },
    views: { type: GraphQLInt },
    createdAt: { type: GraphQLString },
  }),
});

const PropertyType = new GraphQLObjectType({
  name: 'Property',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    price: { type: GraphQLFloat },
    location: { type: GraphQLString },
    type: { type: GraphQLString },
    bedrooms: { type: GraphQLInt },
    bathrooms: { type: GraphQLInt },
    area: { type: GraphQLFloat },
    status: { type: GraphQLString },
    agent: { type: AgentType },
  }),
});

const AgentType = new GraphQLObjectType({
  name: 'Agent',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    license: { type: GraphQLString },
  },
});

const ListingFilterInput = new GraphQLInputObjectType({
  name: 'ListingFilterInput',
  fields: {
    city: { type: GraphQLString },
    status: { type: GraphQLString },
    minPrice: { type: GraphQLInt },
    maxPrice: { type: GraphQLInt },
  },
});

const PropertyFilterInput = new GraphQLInputObjectType({
  name: 'PropertyFilterInput',
  fields: {
    type: { type: GraphQLString },
    status: { type: GraphQLString },
    minPrice: { type: GraphQLFloat },
    maxPrice: { type: GraphQLFloat },
  },
});

const Query = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    listings: {
      type: new GraphQLList(ListingType),
      args: { filter: { type: ListingFilterInput } },
      resolve: async (_root, { filter }) => {
        const f = filter || {};
        if (!dbStatus.mongo) {
          return memStore.findListings({
            city: f.city,
            status: f.status,
            minPrice: f.minPrice,
            maxPrice: f.maxPrice,
          });
        }
        const where = {};
        if (filter) {
          if (filter.city) where['location.city'] = filter.city;
          if (filter.status) where.status = filter.status;
          if (filter.minPrice || filter.maxPrice) {
            where.price = {};
            if (filter.minPrice) where.price.$gte = filter.minPrice;
            if (filter.maxPrice) where.price.$lte = filter.maxPrice;
          }
        }
        return Listing.find(where).sort({ createdAt: -1 });
      },
    },
    listing: {
      type: ListingType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_root, { id }) => {
        if (!dbStatus.mongo) return memStore.incrementListingViews(id);
        return Listing.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
      },
    },
    properties: {
      type: new GraphQLList(PropertyType),
      args: { filter: { type: PropertyFilterInput } },
      resolve: async (_root, { filter }) => {
        const f = filter || {};
        if (!dbStatus.postgres) {
          return memStore.findProperties({
            type: f.type,
            status: f.status,
            minPrice: f.minPrice,
            maxPrice: f.maxPrice,
          });
        }
        const where = {};
        if (filter) {
          if (filter.type) where.type = filter.type;
          if (filter.status) where.status = filter.status;
          if (filter.minPrice || filter.maxPrice) {
            where.price = {};
            if (filter.minPrice) where.price.gte = filter.minPrice;
            if (filter.maxPrice) where.price.lte = filter.maxPrice;
          }
        }
        return Property.findAll({ where, include: [{ model: Agent, as: 'agent' }] });
      },
    },
    property: {
      type: PropertyType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_root, { id }) => {
        if (!dbStatus.postgres) return memStore.findPropertyById(id);
        return Property.findByPk(id, { include: [{ model: Agent, as: 'agent' }] });
      },
    },
    agents: {
      type: new GraphQLList(AgentType),
      resolve: async () => {
        if (!dbStatus.postgres) return memStore.agents();
        return Agent.findAll();
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: 'RootMutation',
  fields: {
    createListing: {
      type: ListingType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        price: { type: new GraphQLNonNull(GraphQLFloat) },
        city: { type: GraphQLString },
        status: { type: GraphQLString },
      },
      resolve: (_root, { title, description, price, city, status }) => {
        if (!dbStatus.mongo) {
          return memStore.createListing({
            title,
            description,
            price,
            location: { city },
            status: status || 'available',
          });
        }
        return Listing.create({
          title,
          description,
          price,
          location: { city },
          status: status || 'available',
        });
      },
    },
    incrementViews: {
      type: ListingType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_root, { id }) => {
        if (!dbStatus.mongo) return memStore.incrementListingViews(id);
        return Listing.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
      },
    },
  },
});

module.exports = new GraphQLSchema({ query: Query, mutation: Mutation });