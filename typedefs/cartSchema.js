import { gql } from 'apollo-server-express';

export default gql`
  type _Cart {
    id: ID!
    user: User!
    product: Product!
    quantity:Int!
    
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
   }

   type CartPurchase {
    cartId: ID!
    productId:Product!
    quantity:Int!
    storeName:Store!
    storeOwner:User!
    paymentId:String!
    buyer:User!
  }




  extend type Query {
    usercart:[_Cart]!
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