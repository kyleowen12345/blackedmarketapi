import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthenticationError } from 'apollo-server-express';

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
  },
};