import { AuthenticationError } from 'apollo-server-express';

export default {
  Query: {
    storespaginate: async (parent, {curPage=1}, { models: { storeModel }, me }, info) => {
    //   if (!me) {
    //     throw new AuthenticationError('You are not authenticated');
    //   }
    const perPage=5
      const stores = await storeModel.find({}).sort(({'storeName':-1})).skip((curPage-1)* perPage).limit(perPage).exec();
      const storeCount =await storeModel.find().countDocuments()
      return {
        stores,
        curPage:curPage,
        maxPage:Math.ceil(storeCount / perPage),
        storeCount:storeCount
      };
    },
    storeInfo: async (parent, {id}, { models: { storeModel } }, info) => {
      //   if (!me) {
      //     throw new AuthenticationError('You are not authenticated');
      //   }
     
        const store = await storeModel.findById({_id:id}).exec()
        return store
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
  Store: {
    sellerName: async ({ sellerName }, args, { models: { userModel } }, info) => {
      const user = await userModel.findById({ _id: sellerName }).exec();
      return user;
    },
    // comments: async ({ id }, args, { models: { commentsModel } }, info) => {
    //   console.log(id)
    //   const comment = await commentsModel.find({ postsId: id }).exec();
    //   return comment;
    // },
  },
};