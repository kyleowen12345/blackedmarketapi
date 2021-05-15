import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import sendgridTransport from "nodemailer-sendgrid-transport";
import { AuthenticationError } from 'apollo-server-express';
import {resetpassword} from "../emailtemplates/index.js"
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
      const array = cart.map(item => {
        return {
          id:item.id,
          quantity:item.quantity,
          date:item.date
        }
      })
     return {curPage:"1",maxPage:1,productCount:1,cart:array}
    },
    getHistoryInfo: async (parent, args, { models: { userModel },me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const user = await userModel.findById({ _id: me.id }).exec();
      const history =user.history
      const array = history.map(item => {
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

     return {curPage:"1",maxPage:1,productCount:1,history:array}
    },
    
  },
  Mutation: {
    createUser: async (parent, {name, email, password }, { models: { userModel } }, info) => {
      if(!name) throw new AuthenticationError('Please create a name')
      if(!email) throw new AuthenticationError('Please create a email')
      if(!password) throw new AuthenticationError('Please create a password')
      const savedUser=await userModel.findOne({email:email})
      if(savedUser) throw new AuthenticationError('User Already exist')
      const hashedPassword=await bcrypt.hash(password,12)
      const user = await userModel.create({name, email, password:hashedPassword });
      const token = jwt.sign({ id: user.id,email:user.email }, 'riddlemethis', { expiresIn: '24h'  });
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
      const token = jwt.sign({ id: user.id,email:user.email }, 'riddlemethis', { expiresIn: '24h'  });

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
    
    updateUser: async (parent, { name,profilePic,contactNumber,country,city,SocialMediaAcc,zipcode }, { models: { userModel },me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      if(!name|| !profilePic|| !contactNumber|| !country|| !city || !SocialMediaAcc || !zipcode)  throw new AuthenticationError('complete the fields')
      const user=await userModel.findOne({_id: me.id})
      if(!user)  throw new AuthenticationError('User not Found');
      user.name = name;
      user.profilePic = profilePic;
      user.contactNumber = contactNumber;
      user.country = country;
      user.city = city;
      user.zipcode = zipcode;
      user.SocialMediaAcc = SocialMediaAcc;
      await  user.save()
      return user
    },
  },
  
};