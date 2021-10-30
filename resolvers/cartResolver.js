import { AuthenticationError, UserInputError,ValidationError } from 'apollo-server-express';
import ASYNC from 'async'
export default {
  Query: {
    usercart: async (parent, {offset,limit}, { models: { cartModel }, me }, info) => {
          if (!me) {
            throw new AuthenticationError('You are not authenticated');
          }
        const cart = await cartModel.find({user:me.id}).sort({"createdAt":-1}).skip(offset||0).limit(limit || 1)
        const count =await cartModel.find({user:me.id}).sort({"createdAt":-1}).countDocuments()
        return {
          cart,
          offset:offset || 0,
          limit:limit || 1,
          cartCount: count
        }
          
        },
        cartCount: async (parent, args, { models: { cartModel }, me }, info) => {
          if (!me) {
            throw new AuthenticationError('You are not authenticated');
          }
        
        const count =await cartModel.find({user:me.id}).sort({"createdAt":-1}).countDocuments()
        return {count}
          
        },
  },
  Mutation: {
    addCart: async (parent, {productId,quantity }, { models: { cartModel,productModel },me }, info) => {
        if(!me){
          throw new AuthenticationError('You are not authenticated');
        }
        const product =await productModel.findById({_id:productId})
        const duplicate= await cartModel.findOne({user:me.id,product:productId})

        if(quantity > product.productStocks) {
          return new UserInputError(`This product only has ${product.productStocks} stocks`)
        }

        if(duplicate){
          if(duplicate.quantity + quantity > product.productStocks){
            return new UserInputError(`This product only has ${product.productStocks} stocks`)
          }
           const updated= await cartModel.findOneAndUpdate(
               {user:me.id,product:productId  },
               {$inc:{"quantity": quantity}},
               {new :true}
               ) 
            return updated   
        }else{
            const newCart=await cartModel.create({user:me.id,product:productId,quantity:quantity })
            return newCart
        }
        
  },
  setCartQuantity: async (parent, {productId,quantity }, { models: { cartModel,productModel },me }, info) => {
    if(!me){
      throw new AuthenticationError('You are not authenticated');
    }
    const stocks =await productModel.findById({_id:productId})
   if(quantity > stocks.productStocks){
     return new UserInputError(`This product only has ${stocks.productStocks} stocks`)
   }
   const updated =await cartModel.findOneAndUpdate(
    {user:me.id,product:productId  },
    {$set:{"quantity": quantity}},
    {new :true}
   )
   return updated
},
_removeCartItem: async (parent, {id }, { models: { cartModel },me }, info) => {
  if(!me){
    throw new AuthenticationError('You are not authenticated');
  }
//   const stocks =await productModel.findById({_id:productId})
//  if(quantity > stocks.productStocks){
//    return new UserInputError(`This product only has ${stocks.productStocks} stocks`)
//  }
 await cartModel.findOneAndDelete({_id:id })
 return {message:"Product in removed"}
},
_removeSelectedCartItem: async (parent, {cart }, { models: { cartModel },me }, info) => {
  if(!me){
    throw new AuthenticationError('You are not authenticated');
  }
//   const stocks =await productModel.findById({_id:productId})
//  if(quantity > stocks.productStocks){
//    return new UserInputError(`This product only has ${stocks.productStocks} stocks`)
//  }

 await cartModel.deleteMany({_id:cart.map(i=>i.cartId) })

 return {message:"Products in removed"}
},
singlePurchase: async (parent, {product }, { models: { cartModel,userModel,productModel },me }, info) => {
  if(!me){
    throw new AuthenticationError('You are not authenticated');
  }
//   const stocks =await productModel.findById({_id:productId})
//  if(quantity > stocks.productStocks){
//    return new UserInputError(`This product only has ${stocks.productStocks} stocks`)
//  }

//  await cartModel.deleteMany({_id:cart.map(i=>i.cartId) })
    // console.log(cart)
    
  await userModel.findOneAndUpdate(
    { _id: me.id },
    { $push: { history: product } },
    { new: true }
  )

  
   await productModel.updateOne(
      {_id: product.productId},
      {$inc:{
        "sold":product.quantity,
        "productStocks":-product.quantity
      }},
      { new: true },
     
   )
  await cartModel.findOneAndDelete({_id:product.cartId })
 return product
},
selectedCartItemPurchase: async (parent, {cart }, { models: { cartModel,userModel,productModel },me }, info) => {
  if(!me){
    throw new AuthenticationError('You are not authenticated');
  }
//   const stocks =await productModel.findById({_id:productId})
//  if(quantity > stocks.productStocks){
//    return new UserInputError(`This product only has ${stocks.productStocks} stocks`)
//  }

//  await cartModel.deleteMany({_id:cart.map(i=>i.cartId) })
    // console.log(cart)

  await userModel.findOneAndUpdate(
    { _id: me.id },
    { $push: { history: cart } },
    { new: true }
  )

  ASYNC.eachSeries(cart,(item,callback)=>{
     productModel.updateMany(
      {_id: item.productId},
      {$inc:{
        "sold":item.quantity,
        "productStocks":-item.quantity
      }},
      { new: true },
      callback
   )
  })
  await cartModel.deleteMany({_id:cart.map(i=>i.cartId) })
 return cart
},
},
_Cart: {
    user: async ({ user }, args, { models: { userModel } }, info) => {
        const User = await userModel.findById({ _id: user }).exec();
      return User;
    },
    product: async ({ product }, args, { models: { productModel } }, info) => {
        const Product = await productModel.findById({ _id: product }).exec();
      return Product;
    },
  },
  CartPurchase: {
    storeName: async ({ storeName }, args, { models: { storeModel } }, info) => {
      const store = await storeModel.findById({ _id: storeName }).exec();
      return store;
    },
    storeOwner: async ({ storeOwner }, args, { models: { userModel } }, info) => {
      const user = await userModel.findById({ _id: storeOwner }).exec();
      return user;
    },
    buyer: async ({ buyer }, args, { models: { userModel } }, info) => {
      const user = await userModel.findById({ _id: buyer }).exec();
      return user;
    },
    productId: async ({ productId }, args, { models: { productModel } }, info) => {
      const product = await productModel.findById({ _id: productId }).exec();
      return product;
    },
  },
};