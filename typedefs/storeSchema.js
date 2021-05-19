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
  type Buyer{
    name:String!
    email:String!
    profile:String!
  }
  type StatSheet{
    id:String!
    name:String!
    price:String!
    image:String!
    quantity:String!
    storeName:String!
    storeOwner:String!
    dateOfPurchase:Date!
    buyer:Buyer!
  }
  extend type Query {
    storespaginate(curPage:String!): Paginator!
    storeInfo(id:ID!):Store!
    getStoreStats(storeId:String!): [StatSheet!]!
  }
  type Paginator {
    curPage: String
    maxPage: Int
    storeCount: Int
    stores: [Store!]!
}
`;