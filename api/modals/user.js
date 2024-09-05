const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    images:{
        type:Array,
        // required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    user_type:{
        enum: ['user', 'courier'],
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true,
        default:"null"
    },
    // secondName:{
    //     type:String,
    //     required:true,
    //     default:"null"
    // },
    // truckNumber:{
    //     type:String,
    //     required:true,
    //     default:"null"
    // },
    // trailerNumber:{
    //     type:String,
    //     required:true,
    //     default:"null"
    // },
    fillFormStatus:{
        type:Number,
        required:true,
        default:0
    }
})

module.exports = mongoose.model('User',UserSchema)