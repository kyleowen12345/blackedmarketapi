import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import helmet from 'helmet'
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import dotenv from "dotenv"

import schemas from './typedefs/index.js';
import resolvers from './resolvers/index.js';

import userModel from './models/userModel.js';
import storeModel from './models/storeModel.js';
import productModel from './models/productModel.js'
import paymentModel from './models/paymentModel.js';

dotenv.config();
const app = express();
const corsOptions = {
	origin: process.env.PUBLIC_URL,
	optionsSuccessStatus: 200, // For legacy browser support
	// method: "GET, POST, DELETE,",
};
app.use(cors(corsOptions));
app.use(helmet({ contentSecurityPolicy: (process.env.NODE_ENV === 'production') ? undefined : false })) 


mongoose.connect(
    process.env.MONGO_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    },()=>
      console.log("connected to mongoDB")
  );

  const getUser = async (req) => {
    const token = req.headers['token'];
  
    if (token) {
      try {
        return await jwt.verify(token, 'riddlemethis');
      } catch (e) {
        throw new AuthenticationError('Your session expired. Sign in again.');
      }
    }
  };

  const server = new ApolloServer({
    typeDefs: schemas,
    resolvers,
    context: async ({ req }) => {
      if (req) {
        const me = await getUser(req);
  
        return {
          me,
          models: {
            userModel,
            storeModel,
            productModel,
            paymentModel
          },
        };
      }
    },
  });

  server.applyMiddleware({ app, path: '/graphql' });
const port =process.env.PORT || 4000
app.listen(port, () => {
    console.log(`Server will start at ${port}`)
    
  });