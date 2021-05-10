import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import helmet from 'helmet'
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import dotenv from "dotenv"

import schemas from './typedefs/index.js';
import resolvers from './resolvers/index.js';

const app = express();
app.use(cors());
app.use(helmet({ contentSecurityPolicy: (process.env.NODE_ENV === 'production') ? undefined : false })) 
dotenv.config();

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

  const server = new ApolloServer({
    typeDefs: schemas,
    resolvers,
    // context: async ({ req }) => {
    //   if (req) {
    //     const me = await getUser(req);
  
    //     return {
    //       me,
    //       models: {
    //         userModel,
    //         storeModel
    //       },
    //     };
    //   }
    // },
  });

  server.applyMiddleware({ app, path: '/graphql' });

app.listen(4000, () => {
    console.log(`Server will start at ${4000}`)
    
  });