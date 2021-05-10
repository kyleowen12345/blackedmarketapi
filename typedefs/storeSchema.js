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
    contactNumber:String !
  }

  extend type Query {
    storespaginate(curPage:Int!): Paginator!
  }
  type Paginator {
    curPage: Int
    maxPage: Int
    storeCount: Int
    stores: [Store!]!
}


`;