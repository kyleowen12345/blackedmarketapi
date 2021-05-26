import { AuthenticationError } from 'apollo-server-express';
import ASYNC from 'async'
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
    storeInfoUpdate: async (parent, {id}, { models: { storeModel },me }, info) => {
          if (!me) {
            throw new AuthenticationError('You are not authenticated');
          }
       
          const store = await storeModel.findById({_id:id}).exec()
          return store
        },
    getStoreStats: async (parent, {storeId}, { models: { paymentModel,storeModel },me }, info) => {
          if (!me) {
            throw new AuthenticationError('You are not authenticated');
          }
       
          const store = await paymentModel.find({})
          const youStore=await storeModel.findById({_id:storeId}).exec()
          const result=store.map(i=>i.product)
          let statSheet=[]
          result.forEach((info)=>{
            info.forEach((data)=>{
              statSheet.push(data)
            })
          })
          const yourStats=statSheet?.filter(i=>i.storeName?.includes(storeId))
          return {store:youStore,stats:yourStats}
           
          
        },
    myStores: async (parent, {curPage=1}, { models: { storeModel },me }, info) => {
          if (!me) {
            throw new AuthenticationError('You are not authenticated');
          }
          const perPage=5
        const mystores=await storeModel.find({sellerName:me.id}).sort(({'storeName':-1})).skip((curPage-1)* perPage).limit(perPage).exec()
        const storeCount =await storeModel.find({sellerName:me.id}).countDocuments()
        return {
          stores:mystores,
          curPage:curPage,
          maxPage:Math.ceil(storeCount / perPage),
          storeCount:storeCount
        };
        },
  },
  Mutation: {
    createStore: async (parent, {storeName, storeAddress, storeDescription,storeType,socialMediaAcc,contactNumber }, { models: { storeModel,userModel },me }, info) => {
      if(!me){
        throw new AuthenticationError('You are not authenticated');
      }
    const user=  await userModel.findById({_id:me.id})
    if (user.Seller===false){
      throw new AuthenticationError('You are not a Seller');
    }
   const takenName= await storeModel.findOne({storeName:storeName})
   if(takenName){
    throw new AuthenticationError(`${storeName} is already taken`);
   }
    const newStore =new storeModel({storeName, storeAddress, storeDescription,storeType,socialMediaAcc,contactNumber,sellerName:me.id})
    await newStore.save()
    return newStore
      
    },
    storeImage: async (parent, {id,storeBackgroundImage }, { models: { storeModel },me }, info) => {
    if(!me){
      throw new AuthenticationError('You are not authenticated');
    }
    const store=await storeModel.findById({_id:id})
    store.storeBackgroundImage=storeBackgroundImage
    store.save()
    return {message:`Image Uplaoded`}
    },
    deleteStore: async (parent, {id }, { models: { storeModel },me }, info) => {
      if(!me){
        throw new AuthenticationError('You are not authenticated');
      }
      await storeModel.findByIdAndDelete({_id:id})
      return {message:`Store Deleted`}
      },
    updateStore: async (parent, {id,storeName, storeAddress, storeDescription,storeType,socialMediaAcc,contactNumber }, { models: { storeModel },me }, info) => {
        if(!me){
          throw new AuthenticationError('You are not authenticated');
        }
     const takenName= await storeModel.findOne({storeName:storeName})
     if(takenName){
      throw new AuthenticationError(`${storeName} is already taken`);
     }
      const storeupdate =await storeModel.findOne({_id:id})
      storeupdate.storeName=storeName
		  storeupdate.storeAddress=storeAddress
		  storeupdate.storeDescription=storeDescription
		  storeupdate.storeType=storeType
		  storeupdate.socialMediaAcc=socialMediaAcc
      storeupdate.contactNumber=contactNumber
		  await storeupdate.save()
      return storeupdate
        
      },
  },
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