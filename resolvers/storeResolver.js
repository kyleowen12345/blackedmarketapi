import { AuthenticationError } from 'apollo-server-express';
export default {
  Query: {
    storespaginate: async (parent, {curPage=1,sortOrder='storeName'}, { models: { storeModel }, me }, info) => {
    //   if (!me) {
    //     throw new AuthenticationError('You are not authenticated');
    //   }
    const perPage=6
      const stores = await storeModel.find({}).sort(({[sortOrder]:-1})).skip((curPage-1)* perPage).limit(perPage).exec();
      const storeCount =await storeModel.find().countDocuments()
      return {
        stores,
        curPage:curPage,
        maxPage:Math.ceil(storeCount / perPage),
        storeCount:storeCount
      };
    },
    storeInfo: async (parent, {id}, { models: { storeModel,productModel },me }, info) => {
        const store = await storeModel.findById({_id:id}).exec()
        let follower= false
        if(me){
          store.followers.map((item)=>{
            if (item.id == me.id) {
              follower = true;
            }
          })
        }
        const storeProducts=await productModel.find({storeName:id}).limit(10).exec()
        return {store:store,products:storeProducts,isUserAFollower:follower}
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
    storeProducts: async (parent, {storeId,curPage,sortOrder}, { models: { storeModel,productModel },me }, info) => {
      const perPage=15
      const storeProducts=await productModel.find({storeName:storeId}).sort(({[sortOrder]:-1})).skip((curPage-1)*perPage).limit(perPage).exec()
      const productCount=await productModel.find({storeName:storeId}).countDocuments()
      return {
        products:storeProducts,
        curPage:curPage,
        maxPage:Math.ceil(productCount / perPage),
        productCount:productCount
      }
        }, 
    allMyStores: async (parent, args, { models: { storeModel },me }, info) => {
         const myStores=await storeModel.find({sellerName:me.id}).sort(({'storeName':1}))
         return myStores
    },
    allMyStoresPaginated: async (parent, {curPage=1,sortOrder='storeName',keyword}, { models: { storeModel },me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const perPage=9
      const myStores=await storeModel.find({$and:[{sellerName:me.id,storeName:new RegExp(keyword,'i')}]}).sort(({[sortOrder]:-1})).skip((curPage-1)* perPage).limit(perPage).exec()
      const storeCount =await storeModel.find({$and:[{sellerName:me.id,storeName:new RegExp(keyword,'i')}]}).countDocuments()
      return {
        stores:myStores,
        curPage:curPage,
        maxPage:Math.ceil(storeCount / perPage),
        storeCount:storeCount
      }
    }, 
    dashBoard: async (parent, args, { models: { storeModel,productModel },me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const productCount=await productModel.find({storeOwner:me.id}).countDocuments()

      const storeCount=await storeModel.find({sellerName:me.id}).countDocuments()

      const products=await productModel.find({storeOwner:me.id}).sort(({'sold':-1})).limit(5)

      const allProducts=await productModel.find({storeOwner:me.id}).sort(({'sold':-1}))

      const soldCount= allProducts?.reduce((acc,obj)=>{return acc + obj.sold},0)

      const stores=await storeModel.find({sellerName:me.id}).sort({'followers':-1}).limit(5)
      
      return {
        productCount:productCount,
        productSoldCount:soldCount,
        storeCount:storeCount,
        stores:stores,
        products:products
      }
     },
     storeStats: async (parent, {id}, { models: {productModel },me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const productCount=await productModel.find({storeName:id}).countDocuments()

      const products=await productModel.find({storeName:id}).sort(({'sold':-1})).limit(5)

      const allProducts=await productModel.find({storeName:id}).sort(({'sold':-1}))

      const soldCount= allProducts?.reduce((acc,obj)=>{return acc + obj.sold},0)
       
     
      return {
        productCount:productCount,
        productSoldCount:soldCount,
        products:products
      }
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
    deleteStore: async (parent, {id }, { models: { storeModel,productModel },me }, info) => {
      if(!me){
        throw new AuthenticationError('You are not authenticated');
      }
      const prohibited= await storeModel.findById({_id:id})
        if(prohibited.sellerName !=me.id){
         throw new AuthenticationError(`Your not authorized`);
        }
      await storeModel.findByIdAndDelete({_id:id})
      await productModel.deleteMany({storeName:id})
      return {message:`Store Deleted`}
      },
    updateStore: async (parent, {id,storeName, storeAddress, storeDescription,storeType,socialMediaAcc,contactNumber }, { models: { storeModel },me }, info) => {
        if(!me){
          throw new AuthenticationError('You are not authenticated');
        }
        const prohibited= await storeModel.findById({_id:id})
        if(prohibited.sellerName !=me.id){
         throw new AuthenticationError(`Your not authorized`);
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