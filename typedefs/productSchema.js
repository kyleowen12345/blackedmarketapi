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
    createdAt:Date!
    _id:ID!
  }
  type Landing {
    products: [Product!]!
    stores: [Store!]!
    deals:[Product!]!
}
  type ProductPaginator {
  curPage: String
  maxPage: Int
  productCount: Int
  products: [Product!]!
}
type ProductDetail {
  product: Product!
  relatedProducts:String!
}


extend type Query {
    landingpage: Landing!
    productInfo(id:ID!):ProductDetail!
    productInfoUpdate(id:ID!):Product!
    productpaginate(curPage:String!): ProductPaginator!
    productCategory(category:String!,curPage:String!):ProductPaginator!
    latestProduct:[Product!]!
    
    searchProduct(product:String!,curPage:String):ProductPaginator!
  }
  
extend type Mutation{
  createProduct(productName:String!,price:String!,productStocks:String!,description:String!,storeName:ID!):Product!
  deleteProduct(id:ID!):Message!
  updateProduct(id:ID!,productName:String!,price:String!,productStocks:String!,description:String!):Product!
  productImage(id:ID!,image:String!):Message!
  
}


`;