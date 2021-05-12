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
    user: async (parent, {id}, { models: { userModel } }, info) => {
    //   if (!me) {
    //     throw new AuthenticationError('You are not authenticated');
    //   }
    //   console.log(me.id)
      const user = await userModel.findById({ _id: id }).exec();
      return user;
    },
    
    
  },
  Mutation: {
    createUser: async (parent, {name, email, password }, { models: { userModel } }, info) => {
      if(!name) throw new AuthenticationError('Please create a name')
      if(!email) throw new AuthenticationError('Please create a email')
      if(!password) throw new AuthenticationError('Please create a password')
      try {
      const savedUser=await userModel.findOne({email:email})
      if(savedUser) throw new AuthenticationError('User Already exist')
      const hashedPassword=await bcrypt.hash(password,12)
      const user = await userModel.create({name, email, password:hashedPassword });
      const token = jwt.sign({ id: user.id,email:user.email }, 'riddlemethis', { expiresIn: '24h'  });
      return {token}
      } catch (error) {
     return error
      }
      
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
        return {token:error}
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
  },
};