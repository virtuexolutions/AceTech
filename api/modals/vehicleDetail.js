const mongoose = require('mongoose')

const vehicleDetailSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    secondName: {
        type: String,
        required: true
    },
    truckNumber: {
        type: String,
        required: true
    },
    trailerNumber: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('VehicleDetail', vehicleDetailSchema)