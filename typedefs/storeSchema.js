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
    createdAt:Date!
    contactNumber:String!
    storeBackgroundImage:String!
    followers:[User!]!
    date:Date!
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
  type StoreStatSheet{
    store:Store!
    stats:[StatSheet!]!
  }
  type StoreswithProduct{
    store:Store!
    products:[Product!]!
    isUserAFollower:Boolean
  }
  type StoreProducts{
    products:[Product!]!
    curPage: String!
    maxPage: Int
    productCount: Int
  }
  type DashBoardInfo{
    productCount:Int!
    productSoldCount:Int!
    storeCount:Int!
    stores:[Store!]!
    products:[Product!]!
  }
  type StoreStats{
    productCount:Int!
    productSoldCount:Int!
    products:[Product!]!
  }
  extend type Query {
    storespaginate(curPage:String!,sortOrder:String!): Paginator!
    storeInfo(id:ID!):StoreswithProduct!
    storeInfoUpdate(id:ID!):Store!
    getStoreStats(storeId:String!): StoreStatSheet!
    myStores(curPage:String!):Paginator!
    storeProducts(storeId:String!,curPage:String!,sortOrder:String!):StoreProducts!
    allMyStores:[Store!]!
    allMyStoresPaginated(curPage:String!,sortOrder:String!,keyword:String):Paginator!
    dashBoard:DashBoardInfo!
    storeStats(id:ID!):StoreStats!
  }
  extend type Mutation {
   createStore(storeName:String!,storeAddress:String!,storeDescription:String!,storeType:String!,socialMediaAcc:String!,contactNumber:String!):Store!
   storeImage(id:ID!,storeBackgroundImage:String!):Message!
   deleteStore(id:ID!):Message!
   updateStore(id:ID!,storeName:String!,storeAddress:String!,storeDescription:String!,storeType:String!,socialMediaAcc:String!,contactNumber:String!):Store!
  }
  
 
`;