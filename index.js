import cors from 'cors';
import consola from 'consola';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Import Application Constants

// Router imports
import userApis from './apis/users.js';

// Initialize express application
const app = express();

dotenv.config();
// Apply Application Middlewares
app.use(cors());
app.use(bodyParser.json());

// Inject Sub router and apis
app.use('/api', userApis);

const DB = process.env.APP_DB;
const PORT = process.env.PORT || process.env.APP_PORT;
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
