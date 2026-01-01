const mongoose= require("mongoose")
const bcrypt= require("bcryptjs")
const jwt=require("jsonwebtoken")

const userSchema= new mongoose.Schema({
    username:{type:String, require:true},
    email:{type:String, require:true, unique:true},
    password:{type:String, require:true},
    address:{type:String},
    role:{type:String, default:"customer"}
},
{ timestamps: true }
)

userSchema.pre("save", async function(next){
    try {
        if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)
    }
    next()
    } catch (error) {
        console.log("bcrypt connection error",error.message)
    }
})

//  JWT Generate Method (IMPORTANT)
userSchema.methods.generateToken = function () {
    const payload = {
      id: this._id,
      email: this.email,
      role: this.role
    };
  
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30d"
    });
  };
  

const User= mongoose.model("user",userSchema)
module.exports= User;