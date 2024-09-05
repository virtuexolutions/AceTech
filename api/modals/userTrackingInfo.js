const mongoose = require('mongoose')

const UserTrackingInfoSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    location:{
        type:{
            type:String,
            required:true
        },
        coordinates:[]
    },
    finishStatus: {
        type:String,
        required: true,
        default:"null"
    },
})

UserTrackingInfoSchema.index({location:'2dsphere'})
module.exports = mongoose.model('UserTrackingInfo',UserTrackingInfoSchema)