import validator from 'validator'
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from "../models/doctorModel.js"



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
                    Image:imageUrl,
                    password:hashedPassword,
                    speciality,
                    degree,
                    experience,
                    about,
                    fees,
                    address:JSON.parse(address),
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

export {addDoctor}