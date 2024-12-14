import mongoose from "mongoose"

import dotenv from "dotenv"


dotenv.config();
const uri=process.env.DB_URL;
console.log(uri)
if(!uri){
    console.log("Error connecting to MongoDB")
}
const connectDB=async()=>{
    try{
        await mongoose.connect(uri)
        console.log("Connected to MongoDB")
    }catch(error){
        console.log("Error connecting to MongoDB",error.message)
    }
}
export default connectDB;