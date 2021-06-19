import { gql } from 'apollo-server-express';

export default gql`
scalar Date
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
    createdAt:Date
    cart:Product!
  }
  type Token {
    token: String!
  }
  type Cart{
    id:String!
    productName:String!
    image:String!
    price:String!
    quantity:Int!
    date:Date!
    storeName:ID!
    storeOwner:ID!
  }
  type History{
    id:String!
    name:String!
    price:String!
    image:String!
    quantity:String!
    storeName:ID!
    storeOwner:ID!
    dateOfPurchase:Date!
  }
  type historyPaginate{
    curPage: String
    maxPage: Int
    productCount: Int
    history:[History!]!
  }
  type cartPaginate{
    curPage: String
    maxPage: Int
    productCount: Int
    cart:[Cart!]!
  }
  
 
  extend type Query {
    user: User!
    getCartInfo(curPage:String!): cartPaginate!
    getHistoryInfo(curPage:String!): historyPaginate!
  }
   extend type Mutation {
    createUser(name:String!, email: String!, password: String!): Token!
    login(email: String!, password: String!): Token! 
    resetPassword(email:String!): Token!
    newPassword(token:String!,password:String!):Token!
    updateUser(name:String!,profilePic:String!,contactNumber:String!,country:String!,city:String!,SocialMediaAcc:String!,zipcode:String!): User!
    addToCart(id:ID!,quantity:Int,productName:String!,image:String!,price:String!,storeName:ID!,storeOwner:ID!): Token!
    removeItem(id:ID!):Token!
  }
`;