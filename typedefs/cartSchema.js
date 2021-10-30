import { gql } from 'apollo-server-express';

export default gql`
  type _Cart {
    id: ID!
    user: User!
    product: Product!
    quantity:Int!
    
  }
  type PaginatedCart{
    cart:[_Cart]!
    offset:Int!
    limit:Int!
    cartCount:Int!
  }
  type CartCount{
    count:Int!
  }

  input CartInput {
    cartId: ID!
   }

   input CartPurchaseInput {
     cartId: ID!
     productId:ID!
     quantity:Int!
     storeName:ID!
     storeOwner:ID!
     paymentId:String!
     buyer:ID!
     dateOfPurchase:Date!
   }

   type CartPurchase {
    cartId: ID!
    productId:Product!
    quantity:Int!
    storeName:Store!
    storeOwner:User!
    paymentId:String!
    buyer:User!
    dateOfPurchase:Date!
  }




  extend type Query {
    usercart(offset:Int!,limit:Int!):PaginatedCart!
    cartCount:CartCount!
  }
  
  extend type Mutation{
    addCart(productId:ID!,quantity:Int!):_Cart!
    setCartQuantity(productId:ID!,quantity:Int!):_Cart!
    _removeCartItem(id:ID!):Message!
    _removeSelectedCartItem(cart:[CartInput]):Message!
    singlePurchase(product:CartPurchaseInput!):CartPurchase!
    selectedCartItemPurchase(cart:[CartPurchaseInput]!):[CartPurchase]!
}


`;