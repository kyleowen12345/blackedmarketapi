import { gql } from 'apollo-server-express';

export default gql`
  type Product {
    id: ID!
    storeName: Store!
    storeOwner: User!
    productName:String!
    Rating: String!
    price:String!
    productStocks:String!
    sold:String!
    image:String!
    description:String!
    createdAt:String!
  }

  extend type Query {
    landingpage: Landing!
  }
  type Landing {
    products: [Product!]!
    stores: [Store!]!
}



`;