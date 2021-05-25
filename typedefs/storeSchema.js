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
    email:String!
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
  type Paginator {
    curPage: String
    maxPage: Int
    storeCount: Int
    stores: [Store!]!
  }
  type Message{
    message:String!
  }
 
  extend type Query {
    storespaginate(curPage:String!): Paginator!
    storeInfo(id:ID!):Store!
    getStoreStats(storeId:String!): [StatSheet!]!
  }
  extend type Mutation {
   createStore(storeName:String!,storeAddress:String!,storeDescription:String!,storeType:String!,socialMediaAcc:String!,contactNumber:String!):Store!
  }
  
 
`;