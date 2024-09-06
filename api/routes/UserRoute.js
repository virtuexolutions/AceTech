const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const user = require('../modals/user.js')
const OTP = require("../modals/opt.js")
const userTrackingInfo = require("../modals/userTrackingInfo.js")
const vehicleDetail = require("../modals/vehicleDetail.js")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const auth = require('../../middleware/authMiddleware.js')
const dotenv = require('dotenv').config()

// User Created
router.post('/register', async (req, res, next) => {

    const check_email = req.body.email
    try {
        const existingUser = await user.findOne({ email: check_email });
        const { user_type } = req.body;
        if (existingUser) {
            res.status(200).json({
                success: "false",
                message: "Email Already Exists."
            });
        }
        else {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(req.body.password, salt);

            const newUser = new user({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                email: req.body.email,
                password: hash,
                user_type: req.body.user_type,
            });
            await newUser.save();

            res.status(200).json({
                success: "true",
                message: "User Created"
            });
        }
    } catch (err) {
        console.error(err);
        res.status(200).json({
            success: false,
            message: err.message
        });
    }
})

// Userv Login
router.post('/login', (req, res, next) => {
    user.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(200).json({
                    success: "false",
                    message: "User Not Found"
                })
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (result) {
                    const token = jwt.sign({
                        id: user[0]._id,
                        name: user[0].name,
                        email: user[0].email,
                        user_type: user[0].user_type
                    },

                        process.env.TOKEN, {
                        expiresIn: "24h"
                    })
                    res.status(200).json({
                        id: user[0].id,
                        name: user[0].name,
                        email: user[0].email,
                        user_type: user[0].user_type,
                        secondName: user[0].secondName,
                        truckNumber: user[0].truckNumber,
                        trailerNumber: user[0].trailerNumber,
                        fillFormStatus: user[0].fillFormStatus,
                        token: token
                    });
                }
                else {
                    return res.status(200).json({
                        success: "false",
                        message: "Password Doesn't Match"
                    })
                }
            })
        })
        .catch(err => {
            res.status(200).json({
                success: false,
                message: err.message
            })
        })
})

// User Verification Code Sent To Email
router.post('/email-verification', async (req, res) => {
    const { email } = req.body;
    if (email) {
        const user_email = await user.findOne({ email: email })
        if (user_email) {
            const otp = Math.floor(10000 + Math.random() * 90000);
            // Store the OTP in the database
            const otpData = new OTP({
                _id: new mongoose.Types.ObjectId(),
                userId: user_email._id,
                otpCode: otp,
            });

            await otpData.save();

            res.status(200).json({
                success: "true",
                message: 'OTP Sent Successfully.',
                id: user_email?._id,
                OTP: otp
            })
            // Send the OTP via email
 

        } else {
            res.send({
                success: "false",
                message: "Email Does Not Exist."
            })

        }
    } else {
        res.send({
            success: "false",
            message: "Please Enter Your Correct Email."
        })

    }
})

// Otp Verify
router.post('/verify-otp', async (req, res, next) => {
    const { otp, id } = req.body;

    const otpData = await OTP.findOne({ userId: id, otpCode: otp });
    if (otpData) {
        res.send({
            success: "true",
            message: "Otp Verified Successfully."
        })
    }

    else {
        res.send({
            success: "false",
            message: "Invalid Otp."
        })

    }
})

// Forgot Password
router.post('/forgot-password', async (req, res, next) => {
    const { password, id } = req.body
    const saltt = await bcrypt.genSalt(10);

    const hashed = await bcrypt.hash(password, saltt);
    if (!hashed) {
        res.status(200).json({
            success: "false",
            message: "Password Field Must Be Added."
        })
    }
    else {
        const check = await user.findByIdAndUpdate(id,
            {
                $set: { password: hashed }
            })
        res.status(200).json({
            success: "true",
            message: "Password Has Been Changed."
        })
    }
})

router.post('/verify', async (req, res) => {

    const { email } = req.body;
    if (email) {
        const user_email = await user.findOne({ email: email })
        if (user_email) {
            const otp = Math.floor(10000 + Math.random() * 90000);

            // Send the OTP via email
            // const transporter = nodemailer.createTransport({
            //   host: 'appsdemo.pro',
            //     port: 465,
            //     secure: true, // use SSL
            //     auth: {
            //         user: '_mainaccount@appsdemo.pro',
            //         pass: '@Admin!23###',
            //     },
            // });

            // var transporter = nodemailer.createTransport({
            //     service: 'gmail',
            //     port: 465,
            //     secure: true, // true for 465, false for other ports
            //     logger: true,
            //     debug: true,
            //     secureConnection: false,
            //     auth: {
            //         user: 'visstechapps@gmail.com',
            //         pass: 'bomuubtkvclgvacn',
            //     },
            //     tls: {
            //         rejectUnAuthorized: true
            //     }
            // })

            // const mailOptions = ({
            //     from: 'visstechapps@gmail.com',
            //     to: 'wickybilal99@gmail.com',
            //     subject: 'Password Reset OTP',
            //     text: `Your OTP For Password Reset Is: ${otp}`,
            // });







            try {
                // const info = await transporter.sendMail(mailOptions);
                // console.log('Email sent: ' + info.response);
                res.send({
                    success: "true",
                    message: 'OTP Sent Successfully.',
                    id: user_email?._id,
                    "OTP Code": otp
                });
            } catch (error) {
                console.error('This is an error', error.message);
                res.send({
                    success: "false",
                    message: error.message
                });
            }

        } else {
            res.send({
                success: "false",
                message: "Email Does Not Exist."
            })

        }
    } else {
        res.send({
            success: "false",
            message: "Please Enter Your Correct Email."
        })

    }
})

// User Fill Data
router.use('/user-fill-data', auth)
router.post('/user-fill-data', async (req, res, next) => {

    try {
        const UserId = req.user._id;
    
        if (UserId) 
        {
            const user_Exist = await user.findById(UserId);

            const newVehicleDetail = new vehicleDetail({
                _id: new mongoose.Types.ObjectId(),
                userId: user_Exist._id,
                secondName:req.body.secondName,
                truckNumber:req.body.truckNumber,
                trailerNumber:req.body.trailerNumber,
            })
            await newVehicleDetail.save();

            if(newVehicleDetail)
            {
                await user.findByIdAndUpdate(user_Exist._id, {
                    $set: { fillFormStatus: 1 }
                })
            }

            res.status(200).json({
                success: true,
                message: "User Filled Form Data."
            })
        }

        else 
        {
            res.status(200).json({
                success: false,
                message: "User Doesn't Found."
            })

        }

    } catch (error) {
        res.status(200).json({
            success: false,
            message: error.message
        })
    }
    
})

// All Vehicle Details
router.use('/all-vehicle',auth)
router.get('/all-vehicle', async(req,res,next)=>{
    try {
        const allVehicle = await vehicleDetail.find({})
        allVehicleLocation = []
        for(i=0;i<allVehicle.length;i++){
            
            const vehicleLocation = await userTrackingInfo.findOne({userId: allVehicle[i].userId})
            // console.log(vehicleLocation.location)
            // return
            allVehicleLocation.push({
                _id:allVehicle[i]._id,
                userId:allVehicle[i].userId,
                secondName:allVehicle[i].secondName,
                truckNumber:allVehicle[i].truckNumber,
                trailerNumber:allVehicle[i].trailerNumber,
                location:(vehicleLocation ? vehicleLocation.location: null)
            })
        }

        res.status(200).json({
            success: true,
            data: allVehicleLocation
        });
    } catch (error) {
        res.status(200).json({
            success: false,
            data: error.message
        });
    }
})

// Vehicle Detail By User Id
// router.use('/vehicle-userid',auth)
// router.get('/vehicle-userid', async(req,res,next)=>{
//     try {
//         const allVehicle = await vehicleDetail.find({})
//         allVehicleLocation = []
//         for(i=0;i<allVehicle.length;i++){
            
//             const vehicleLocation = await userTrackingInfo.findOne({userId: allVehicle[i].userId})
//             // console.log(vehicleLocation.location)
//             // return
//             allVehicleLocation.push({
//                 _id:allVehicle[i]._id,
//                 userId:allVehicle[i].userId,
//                 secondName:allVehicle[i].secondName,
//                 truckNumber:allVehicle[i].truckNumber,
//                 trailerNumber:allVehicle[i].trailerNumber,
//                 location:(vehicleLocation ? vehicleLocation.location: null)
//             })
//         }

//         res.status(200).json({
//             success: true,
//             data: allVehicleLocation
//         });
//     } catch (error) {
//         res.status(200).json({
//             success: false,
//             data: error.message
//         });
//     }
// })

// User Tracking Info
router.use('/user-tracking-info', auth)
router.post('/user-tracking-info', async (req, res, next) => {

    const userId = req.user._id;
    const UserExist = await user.findOne(userId);

    if (UserExist) {
        const newUserTrackingInfo = new userTrackingInfo({
            _id: new mongoose.Types.ObjectId(),
            userId: req.user._id,
            location: {
                type: "Point",
                coordinates: [
                    parseFloat(req.body.longitude),
                    parseFloat(req.body.latitude)
                ]
            },
        })
        await newUserTrackingInfo.save();

        res.status(200).json({
            success: "true",
            message: "User Tracking Location Updated.",
        })
    }

    else {
        res.status(200).json({
            success: "false",
            message: "User Doesn't Found."
        })

    }
})


// User Tracking Info
router.use('/user-tracking-infoo', auth)
router.post('/user-tracking-infoo', async (req, res, next) => {

    try
    {
        const userId = req.user._id;
        const UserExist = await user.findOne(userId);
        const userTrackingId = req.body.userTrackingId;

        if (UserExist)
        {
            if (userTrackingId == "") {
                const newUserTrackingInfo = new userTrackingInfo({
                    _id: new mongoose.Types.ObjectId(),
                    userId: req.user._id,
                    location: {
                        type: "Point",
                        coordinates: [
                            parseFloat(req.body.longitude),
                            parseFloat(req.body.latitude)
                        ]
                    },
                })
                await newUserTrackingInfo.save();

                res.status(200).json({
                    success: true,
                    message: "User Tracking Location Started.",
                    trackingInfo: newUserTrackingInfo._id
                })

            }
            else if (userTrackingId)
            {
                const trackingInfoExist = await userTrackingInfo.findOne({ _id: userTrackingId })
                if (trackingInfoExist.finishStatus == "finish")
                {
                    res.status(200).json({
                        success: true,
                        message: "User Tracking Location Finished.",
                        trackingInfo: trackingInfoExist._id
                    })
                }
                else
                {
                    const updateUserTracking = await userTrackingInfo.findByIdAndUpdate(userTrackingId, {
                        $set: {
                            location: {
                                type: "Point",
                                coordinates: [
                                    parseFloat(req.body.longitude),
                                    parseFloat(req.body.latitude)
                                ]
                            },
                            finishStatus: req.body.finishStatus != "" ? req.body.finishStatus : "null"

                        }
                    }, { new: true })
                    console.log(updateUserTracking);
                    // return
                    res.status(200).json({
                        success: true,
                        message: (updateUserTracking.finishStatus == "finish") ? "User Tracking Location Finished." : "User Tracking Location Updated.",
                        trackingInfo: updateUserTracking._id
                    });
                }
            }
        }

        else {
            res.status(200).json({
                success: false,
                message: "User Doesn't Found."
            })
        }   

    } catch (error) {
        res.status(200).json({
            success: false,
            message: error.message
        })
    }
    
})

module.exports = router