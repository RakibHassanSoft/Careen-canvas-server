
// for  users  info
const mongoose= require("mongoose")
const UserSchemaMethod = require("./UserSchema Method")

 const UserSchema= new  mongoose.Schema({
   fullName:{
        type:String,
        required:true,

     },
     email:{
        type:String,
        required:true,
        unique:true

     },
     password:{
        type:String,
      

     },
     firebaseUid: {
      type: String,
      unique: true, 
    },
    role: {
      type: String,
      enum: ["user", "admin", ],
      default: "user", 
    },
   approvedProjects:{
      ids:[{type:String}]
   },
   totalProjects:{
    type:Number,
    min:1,
    max:5
   }
 },{
    timestamps:true
 })
 UserSchemaMethod(UserSchema)
  module.exports= mongoose.model('user',UserSchema)
