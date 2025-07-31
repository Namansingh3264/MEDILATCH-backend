import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from "../models/userModel.js"
import jwt from 'jsonwebtoken'
import { v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'

//api to register user
const registerUser = async (req, res) => {
    try{
        const {name, email, password} = req.body
        if(!name ||!email ||!password) {
            return res.json({ success:false, message: "Please fill all the fields" });
        } 
 
        //validating email format
        if(!validator.isEmail(email)) {
            return res.json({ success:false, message: "Please enter a valid email" });
        }
        //validating password strength
        if(password.length < 8) {
            return res.json({ success:false, message: "Password should be at least 8 characters long" });
        }
        //hashing password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //saving user to database
        const userData = {name, email, password: hashedPassword}
        const newuser = new userModel(userData)
         const user = await newuser.save()


         const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
         res.json({ success:true, token })

        } catch(error){
            console.log(error)         
            res.json({ success: false, message:error.message })

    }
}




//api to login user
const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body
        
        const user = await userModel.findOne({email})
        if(!user) {
            return res.json({ success:false, message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(isMatch) {
            
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
        res.json({ success:true, token })
        } else{
            res.json({ success: false, message: "Invalid credentials" });
        } }catch(error){
            console.log(error)         
            res.json({ success: false, message:error.message })

        }}

   // api to get user profile data
   const getProfile = async (req, res) => {
       try{
        const  userId  = req.userId
        const userData = await userModel.findById(userId).select('-password')
        
        res.json({ success:true,  userData })
        }catch(error){
            console.log(error)         
            res.json({ success: false, message:error.message })
      
       }

   }

   //api to update user profile data
   const updateProfile = async (req, res) => {
       try{
        
        const {userId, name, phone, address, dob,gender} = req.body
        const imageFile = req.file
         if(!name|| !phone || !dob || !gender) {
            return res.json({ success:false, message: "Data Missing" });
          }await userModel.findByIdAndUpdate(userId, {name, phone, address:JSON.parse(address), dob, gender})


          if(imageFile){
           const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: 'image'})
           const imageURL = imageUpload.secure_url
           await userModel.findByIdAndUpdate(userId, {image: imageURL})
          }

         res.json({ success:true, message: "Profile updated successfully" })

    
        }catch(error){
            console.log(error)         
            res.json({ success: false, message:error.message })
      
       }
   }


// API to book appointment
const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body; // Fixed sloTime typo

        // Fetch doctor data
        const docData = await doctorModel.findById(docId).select('-password');
        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor not available' });
        }

        // Access slots_booked correctly
        let slots_booked = docData.slots_booked || {};

        // Check slot availability
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot not available' });
            } else {
                slots_booked[slotDate].push(slotTime);
            }
        } else {
            slots_booked[slotDate] = [slotTime];
        }

        // Update doctor's booked slots in DB
        docData.slots_booked = slots_booked;
        await docData.save();

        // Fetch user data
        const userData = await userModel.findById(userId).select('-password');

        // Convert doctor data to plain object & remove slots_booked
        const docPlain = docData.toObject();
        delete docPlain.slots_booked;

        // Create appointment
        const appointmentData = {
            userId,
            docId,
            userData,
            docData: docPlain,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        };

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        res.json({ success: true, message: 'Appointment booked successfully' });

       // save new slots data in docData
       await doctorModel.findByIdAndUpdate(docId,{slots_booked})
       res.json ({success:true, message:'Appointment Booked'})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment };
