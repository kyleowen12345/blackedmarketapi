import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import sendgridTransport from "nodemailer-sendgrid-transport";
import { AuthenticationError,UserInputError } from 'apollo-server-express';
import {resetpassword} from "../emailtemplates/index.js"
// import ASYNC from 'async'
dotenv.config();
const transporter = nodemailer.createTransport(
	sendgridTransport({
		auth: {
			api_key: process.env.API_KEY,
		},
	})
);
export default {
  Query: {
    user: async (parent, args, { models: { userModel },me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const user = await userModel.findById({ _id: me.id }).exec();
      return user;
    },
    getCartInfo: async (parent, args, { models: { userModel,productModel },me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const user = await userModel.findById({ _id: me.id }).exec();
      const cart =user.cart
      const array = cart.reverse().map(item => {
        return {
          id:item.id,
          productName:item.productName,
          image:item.image,
          price:item.price,
          quantity:item.quantity,
          storeName:item.storeName,
          storeOwner:item.storeOwner,
          date:item.date
        }
      })
     return {productCount:cart.length,cart:array}
    },
    getHistoryInfo: async (parent, {curPage="1",keyword}, { models: { userModel },me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
  
      const perPage=5
      const user = await userModel.findById({ _id: me.id }).exec();
      const history =user.history
      const array = keyword ? history.filter(key=>key.name.includes(keyword)).reverse().map(item => {
        return {
          id:item.id,
          name:item.name,
          price:item.price,
          image:item.image,
          quantity:item.quantity,
          storeName:item.storeName,
          storeOwner:item.storeOwner,
          dateOfPurchase:item.dateOfPurchase,
        }
      })
      :
      history.reverse().map(item => {
        return {
          id:item.id,
          name:item.name,
          price:item.price,
          image:item.image,
          quantity:item.quantity,
          storeName:item.storeName,
          storeOwner:item.storeOwner,
          dateOfPurchase:item.dateOfPurchase,
        }
      })

      const indexOflastHistory=curPage * perPage

      const indexOfFirstHistory=indexOflastHistory - perPage

      const currentHistory=array.slice(indexOfFirstHistory,indexOflastHistory)

      const maxPage=Math.ceil(array.length / perPage)

     return {curPage:curPage,maxPage:maxPage,productCount:array.length,history:currentHistory}
    },
    getFollowingStore: async (parent, {curPage="1",keyword}, { models: { userModel,storeModel },me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
  
      const perPage=5
      const user = await userModel.findById({ _id: me.id }).exec();
      const following =user.following
      const array = keyword ? following.filter(key=>key.storeName.includes(keyword)).reverse().map(item => {
        return {
          id:item.id,
          storeName:item.storeName,
          storeBackgroundImage:item.storeBackgroundImage,
          storeType:item.storeType,
          date:item.date,
        }
      })
      :
      following.reverse().map(item => {
        return {
          id:item.id,
          storeName:item.storeName,
          storeBackgroundImage:item.storeBackgroundImage,
          storeType:item.storeType,
          date:item.date,
        }
      })

     const stores=await storeModel.find({_id:{$in:array?.map(i=>i.id)}}).sort(({'storeName':1}))

      const indexOflastFollowing=curPage * perPage

      const indexOfFirstFollowing=indexOflastFollowing - perPage

      const currentFollow=stores.slice(indexOfFirstFollowing,indexOflastFollowing)

      const maxPage=Math.ceil(stores.length / perPage)

     return {curPage:curPage,maxPage:maxPage,followCount:array.length,follow:currentFollow}
    },
    
  },
  Mutation: {
    createUser: async (parent, {name, email, password }, { models: { userModel } }, info) => {
      if(!name) throw new AuthenticationError('Please create a name')

      if(!email) throw new AuthenticationError('Please create a email')

      if(!password) throw new AuthenticationError('Please create a password')

      const savedUser=await userModel.findOne({email:email})

      if(savedUser) throw new AuthenticationError('Email Already exist')

      const hashedPassword=await bcrypt.hash(password,12)

      const user = await userModel.create({name, email, password:hashedPassword });

      const token = jwt.sign({ id: user.id,email:user.email,name:user.name,profilePic:user.profilePic }, process.env.SECRET_KEY, { expiresIn: '24h'  });

      return {token}
      
    },
    login: async (parent, { email, password }, { models: { userModel } }, info) => {

      if(!email)  throw new AuthenticationError('Please enter a email')

      if(!password) throw new AuthenticationError('Please enter a password')

      const user = await userModel.findOne({ email:email }).exec();

      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      const matchPasswords = bcrypt.compareSync(password, user.password);

      if (!matchPasswords) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = jwt.sign({ id: user.id,email:user.email,name:user.name,profilePic:user.profilePic }, process.env.SECRET_KEY, { expiresIn: '24h'  });

      return {token};
    },
    resetPassword: async (parent, { email }, { models: { userModel } }, info) => {
      if(!email)  throw new AuthenticationError('Please enter a email')

      let token=null

      try {
        crypto.randomBytes(32,(err,buffer)=>{
          if(err) throw new AuthenticationError(err);
           token=buffer.toString("hex")
        })
        const user=await userModel.findOne({email:email})

        if(!user)  throw new AuthenticationError('User with this email does not exist');

        user.resetToken=token

        user.expireToken=Date.now() + 3600000;

        await user.save()

        await transporter.sendMail({
           to:user.email,
           from:"blackedmarketconfig@gmail.com",
           subject:"Password reset",
           html:resetpassword(token)
        })

        return {token}
      } catch (error) {
        return error
      }
       
    },
    newPassword: async (parent, { token,password }, { models: { userModel } }, info) => {
      if(!token)  throw new AuthenticationError('Access unauthorized')

      if(!password)  throw new AuthenticationError('Please fillout password')

       const newPassword=password

       const sentToken=token

       const user=await userModel.findOne({resetToken:sentToken,expireToken: { $gt: Date.now() }})

       if(!user) throw new AuthenticationError('Try again session expired');

       const hashedPassword=await bcrypt.hash(newPassword, 12)
       
       user.password=hashedPassword
       user.resetToken = undefined;
			 user.expireToken = undefined;
       await user.save()

       return {token:"password update success"}
    },  
    updateUser: async (parent, { name,email,contactNumber,country,city,SocialMediaAcc,zipcode }, { models: { userModel },me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const user=await userModel.findOne({_id: me.id})

      if(!user)  throw new AuthenticationError('User not Found');
      user.name = name;
      user.email = email;
      user.contactNumber = contactNumber;
      user.country = country;
      user.city = city;
      user.zipcode = zipcode;
      user.SocialMediaAcc = SocialMediaAcc;
      await  user.save()
      
      return user
    },
    updateUserImage: async (parent, {profilePic }, { models: { userModel },me }, info) => {
      if(!me){
        throw new AuthenticationError('You are not authenticated');
      }
      const user=await userModel.findById({_id:me.id})
      user.profilePic=profilePic
      user.save()
      
      return user
      },
    confirmUser: async (parent, {password }, { models: { userModel },me }, info) => {

      if(!me) throw new AuthenticationError('You are not authenticated')

      const confirmedUser=await userModel.findOne({_id:me.id})

      const matchPasswords = bcrypt.compareSync(password, confirmedUser.password);

      if (!matchPasswords) {
        throw new AuthenticationError('Invalid credentials');
      }

     return {token:"You are now confirmed"}
      
    },
    addToCart: async (parent, { id,quantity=1,productName,image,price,storeName,storeOwner }, { models: { userModel },me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      
    const userInfo=  await userModel.findOne({_id:me.id}) 
        let duplicate = false
        userInfo.cart.map((item)=>{
          if (item.id == id) {
            duplicate = true;
          }
        })
        if(duplicate){
          userModel.findOneAndUpdate(
            {_id:me.id,"cart.id":id},
            {$inc:{"cart.$.quantity": quantity}},
            {new :true},
            (err,userInfo)=>{
              if (err) throw new AuthenticationError({err});
              
            }
          )
        }else{
          if(userInfo.cart.length > 9) {
            throw new UserInputError('You can only have 10 items in your cart.  Just purchase those items and add something new to your cart.');
          }
          userModel.findOneAndUpdate(
           {_id:me.id},
           {$push:{cart:{id:id,productName:productName,price:price,image:image,quantity:quantity,storeOwner:storeOwner,storeName:storeName,date:new Date()}}},
           {new:true},
           (err,userInfo)=>{
            if (err) throw new AuthenticationError({err});
            
           }
          )
        }
      return {id,quantity,productName,image,price,storeName,storeOwner}
    },
    setQuantity: async (parent, { id,value}, { models: { userModel },me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      await userModel.findOneAndUpdate(
        {_id:me.id,"cart.id":id},
        {"$set":{"cart.$.quantity":value}},
        {new:true}
        )
        return {token:`${id} quantity has been set`}
    },
    removeCartItem: async (parent, {id }, { models: { userModel },me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      await userModel.findOneAndUpdate(
        {_id:me.id},
        {"$pull":{"cart":{"id":id}}},
        {new:true}
        )
        return {token:`${id} has been deleted`}
    },
    followStore: async (parent, {id,storeName,storeBackgroundImage,storeType }, { models: { userModel,storeModel },me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const userInfo=  await userModel.findOne({_id:me.id})

      const storeInfo= await storeModel.findOne({_id:id})
      
      let duplicate = false
      userInfo.following.map((item)=>{
        if (item.id == id) {
          duplicate = true;
        }
      })
      storeInfo.followers.map((item)=>{
        if (item.id == me.id) {
          duplicate = true;
        }
      })
      if(duplicate){
        throw new AuthenticationError('You already follow this');
      }else{
        userModel.findOneAndUpdate(
         {_id:me.id},
         {$push:{following:{id:id,storeName:storeName,storeBackgroundImage:storeBackgroundImage,storeType:storeType,date:new Date()}}},
         {new:true},
         (err,userInfo)=>{
          if (err) throw new AuthenticationError({err});
          
         }
        )
        storeModel.findOneAndUpdate(
          {_id:id},
          {$push:{followers:{id:me.id,email:me.email,name:me.name,profilePic:me.profilePic,date:new Date()}}},
          {new:true},
          (err,storeInfo)=>{
           if (err) throw new AuthenticationError({err});
           
          }
         )
      }
    return {id,storeName,storeBackgroundImage,storeType}
    },
    unfollowStore: async (parent, {id }, { models: { userModel,storeModel },me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      await userModel.findOneAndUpdate(
        {_id:me.id},
        {"$pull":{"following":{"id":id}}},
        {new:true}
        )
      await storeModel.findOneAndUpdate(
          {_id:id},
          {"$pull":{"followers":{"id":me.id}}},
          {new:true}
          )
        return {token:`Unfollowed Successfully`}
    },
    seller: async (parent, args, { models: { userModel },me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
     const user= await userModel.findOneAndUpdate(
        {_id:me.id},
        {Seller:true},
        {new:true}
        )
        return user
    },
  },
  
};