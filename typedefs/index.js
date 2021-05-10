import userSchema from './userSchema.js';
import storeSchema from './storeSchema.js'
import { gql } from 'apollo-server-express';

const linkSchema = gql`
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
`;

export default [linkSchema, userSchema,storeSchema];