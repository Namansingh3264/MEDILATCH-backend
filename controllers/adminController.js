import validator from 'validator'
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from "../models/doctorModel.js"
import jwt from 'jsonwebtoken'



//api for adding doctors
const addDoctor = async (req, res) => {
    try{
         const{name, email, password, speciality, degree, experience, about, fees, address} = req.body
         const imageFile = req.file
         if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success:false, message: "Please fill all the fields" });
         }

            //validating email format
           if(!validator.isEmail(email)) {
               return res.json({ success:false, message: "Invalid email format" });
           }
            //validating strong password
            if(password.length < 8) {
                return res.json({ success:false, message: "Please enter strong password." });
            }
                 
             // ✅ Check file existence
    if (!req.file) {
      return res.json({ success: false, message: "Image file is missing!" });
    }

    
               //hashing doctor password
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)
         
                //upload image to cloudinary
                const imageUpload = await cloudinary.uploader.upload(req.file.path, {resource_type:"image"})
                 const imageUrl = imageUpload.secure_url

                 const doctorData = {
                    name,
                    email,
                    image:imageUrl,
                    password:hashedPassword,
                    speciality,
                    degree,
                    experience,
                    about,
                    fees,
                   address:JSON.parse(address),
                    //  address,
                    date:Date.now()

                 }
                  
                 const newDoctor = new doctorModel(doctorData)
                 await newDoctor.save()
                 res.json({ success: true, message: "Doctor added successfully" });


    } catch (error){
             console.log(error)
             res.json({ success: false, message:error.message });
    }
}

//API for the admin login
const loginAdmin = async(req,res) => {
    try{
        const {email, password} = req.body
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // Generate JWT token
            const token = jwt.sign( email+password, process.env.JWT_SECRET )
             res.json({ success: true, message: "Login successful", token })
        }else {
             res.json({ success:false, message: "Invalid email or password" });
        }

    }
    catch(error){
        console.log(error)
             res.json({ success: false, message:error.message });
        }
    }

              //api to get all doctors list for admin panel

   const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password')
        res.json({success:true, doctors})
    } catch (error){
        console.log(error)
        res.json({success:false,message:error.massage})
    }
   }


export {addDoctor, loginAdmin, allDoctors}