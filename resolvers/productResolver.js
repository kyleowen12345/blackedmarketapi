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
  },
//   Mutation: {
//     createPost: async (parent, { title, content }, { models: { postsModel }, me }, info) => {
//       if (!me) {
//         throw new AuthenticationError('You are not authenticated');
//       }
//       const post = await postsModel.create({ title, content, author: me.id });
//       return post;
//     },
//     deletePost:async (parent,{id},{models: { postsModel }, me },info)=>{
//       if (!me) {
//         throw new AuthenticationError('You are not authenticated');
        
//       }
//       const deletePost=await postsModel.deleteOne({_id:id})
//       if(deletePost.deletedCount) return{id: id}
//           else throw new ApolloError(`Failed to delete Post.`);
//     }
//   },
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