import express from 'express'
import cors from 'cors'
import 'dotenv/config.js'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
//app config
const app = express()
const port = process.env.PORT || 4000
connectDB() // Connect to MongoDB
connectCloudinary() // Connect to Cloudinary


//middlewares
app.use(cors());
app.use(express.json()); // To parse JSON bodies

//api endpoints
app.use('/api/admin' , adminRouter)




// Test Route or api endpoint
app.get('/', (req, res) => {
  res.send('API is running........');
});

// Start server
app.listen(port, () => 
  console.log("Server started ",port))