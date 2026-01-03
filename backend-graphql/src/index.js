import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLScalarType, Kind } from 'graphql';
import dotenv from 'dotenv';
import { typeDefs } from './schema.js';
import { resolvers as baseResolvers } from './resolvers.js';

dotenv.config();

// Custom scalar types
const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    return value;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

const decimalScalar = new GraphQLScalarType({
  name: 'Decimal',
  description: 'Decimal custom scalar type',
  serialize(value) {
    return parseFloat(value);
  },
  parseValue(value) {
    return parseFloat(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.FLOAT || ast.kind === Kind.INT) {
      return parseFloat(ast.value);
    }
    return null;
  },
});

// Merge resolvers with custom scalars
const resolvers = {
  ...baseResolvers,
  Date: dateScalar,
  DateTime: dateTimeScalar,
  Decimal: decimalScalar,
};

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      locations: error.locations,
      path: error.path,
    };
  },
});

// Start server
const { url } = await startStandaloneServer(server, {
  listen: { port: process.env.PORT || 4000 },
  context: async ({ req }) => {
    return {
      headers: req.headers,
    };
  },
});

console.log(`🚀 GraphQL Server ready at: ${url}`);
console.log(`📊 GraphQL Playground available at: ${url}`);
