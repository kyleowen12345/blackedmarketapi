import { gql } from 'apollo-server-express';

export default gql`
  type Store {
    id: ID!
    storeName: String!
    storeAddress: String!
    storeDescription:String!
    storeType: String!
    sellerName:User!
    socialMediaAcc:String!
    createdAt:String!
    contactNumber:String!
    storeBackgroundImage:String!
  }

  extend type Query {
    storespaginate(curPage:String!): Paginator!
    storeInfo(id:ID!):Store!
  }
  type Paginator {
    curPage: String
    maxPage: Int
    storeCount: Int
    stores: [Store!]!
}


`;