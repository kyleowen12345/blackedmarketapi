import { gql } from 'apollo-server-express';

export default gql`
  type User {
    id: ID!
    name: String!
    email: String!
    password:String!
    profilePic: String
    contactNumber:String
    country:String
    SocialMediaAcc:String
    city:String
    zipcode:String
    resetToken:String
    expireToken:String
    Seller:String
    createdAt:String
  }
  type Token {
    token: String!
    user: User!
  }
  extend type Query {
    user(id:ID): User!

  }
  extend type Mutation {
    createUser(name:String!, email: String!, password: String!): Token!
    login(email: String!, password: String!): Token! 
  }
`;