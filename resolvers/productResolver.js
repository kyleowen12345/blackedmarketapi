import { AuthenticationError } from 'apollo-server-express';

export default {
  Query: {
    landingpage: async (parent, args, { models: { productModel,storeModel }, me }, info) => {
    //   if (!me) {
    //     throw new AuthenticationError('You are not authenticated');
    //   }
      const stores=await storeModel.find({}).sort(({'storeName':-1})).limit(15).exec();
      const products = await productModel.find({}).sort(({'productName':-1})).limit(15).exec();
     
      return {stores,products};
    },
    productInfo: async (parent, {id}, { models: { productModel } }, info) => {
      //   if (!me) {
      //     throw new AuthenticationError('You are not authenticated');
      //   }
     
        const product = await productModel.findById({_id:id}).exec()
        return product
      },
    productpaginate: async (parent, {curPage=1}, { models: { productModel }, me }, info) => {
        //   if (!me) {
        //     throw new AuthenticationError('You are not authenticated');
        //   }
        const perPage=4
          const products = await productModel.find({}).sort(({'productName':-1})).skip((curPage-1)* perPage).limit(perPage).exec();
          const productCount =await productModel.find().countDocuments()
          return {
            products,
            curPage:curPage,
            maxPage:Math.ceil(productCount / perPage),
            productCount:productCount
          };
        },
    productInfoUpdate: async (parent, {id}, { models: { productModel } }, info) => {
            if (!me) {
              throw new AuthenticationError('You are not authenticated');
            }
            const product = await productModel.findById({_id:id}).exec()
            return product
          },
  },
  Mutation: {
    createProduct: async (parent, { productName, price,productStocks,description,storeName }, { models: { productModel,userModel  }, me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const user=  await userModel.findById({_id:me.id})
      if (user.Seller===false){
      throw new AuthenticationError('You are not a Seller');
      }
      const takenName= await productModel.findOne({productName:productName})
      if(takenName){
      throw new AuthenticationError(`${productName} is already taken`);
      }
      const newProduct=new productModel({productName,price,productStocks,description,storeName,storeOwner:me.id})
      await newProduct.save()
      return newProduct
    },
    deleteProduct: async (parent, {id }, { models: { productModel },me }, info) => {
      if(!me){
        throw new AuthenticationError('You are not authenticated');
      }
      const prohibited= await productModel.findById({_id:id})
        if(prohibited.storeOwner !=me.id){
         throw new AuthenticationError(`Your not authorized`);
        }
      await productModel.findByIdAndDelete({_id:id})
      return {message:`Store Deleted`}
      },
    updateProduct: async (parent, {id,productName,price, productStocks,description }, { models: { productModel },me }, info) => {
        if(!me){
          throw new AuthenticationError('You are not authenticated');
        }
    const prohibited= await productModel.findById({_id:id})
    if(prohibited.storeOwner !=me.id){
      console.log( typeof prohibited.storeOwner)
      console.log( typeof me.id)
      throw new AuthenticationError(`Your not authorized`);
    }
      const productupdate =await productModel.findOne({_id:id})
      productupdate.productName=productName
		  productupdate.price=price
		  productupdate.productStocks=productStocks
		  productupdate.description=description
		  await productupdate.save()
      return productupdate
        
      },
    productImage: async (parent, {id,image }, { models: { productModel },me }, info) => {
        if(!me){
          throw new AuthenticationError('You are not authenticated');
        }
        const prohibited= await productModel.findById({_id:id})
        if(prohibited.storeOwner !=me.id){
         throw new AuthenticationError(`Your not authorized`);
        }
        const product=await productModel.findById({_id:id})
        product.image=image
        product.save()
        return {message:`Image Uplaoded`}
        },  
  },
Product: {
    storeName: async ({ storeName }, args, { models: { storeModel } }, info) => {
      const store = await storeModel.findById({ _id: storeName }).exec();
      return store;
    },
    storeOwner: async ({ storeOwner }, args, { models: { userModel } }, info) => {
      const user = await userModel.findById({ _id: storeOwner }).exec();
      return user;
    },
  },
};