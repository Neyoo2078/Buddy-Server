import cors from 'cors';
import consola from 'consola';
import express from 'express';
import mongoose from 'mongoose';
import { json } from 'body-parser';

// Import Application Constants
import { DB, PORT } from './src/constants';

// Router imports
import userApis from './src/apis/users';

// Initialize express application
const app = express();

// Apply Application Middlewares
app.use(cors());
app.use(json());

// Inject Sub router and apis
app.use('/api', userApis);

// Connect with the database
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    consola.success('DATABASE CONNECTED...');
    // Start application listening for request on server
    app.listen(PORT, () => consola.success(`Sever started on port ${PORT}`));
  })
  .catch((err) => {
    consola.error(`Unable to start the server \n${err.message}`);
  });
