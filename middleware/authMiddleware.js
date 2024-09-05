const jwt = require('jsonwebtoken')
const UserModal = require('../api/modals/user.js')
const dotenv = require('dotenv').config()

var CheckUserAuth = async(req,res,next)=>{
    let token
    const {authorization} = req.headers

    if(authorization && authorization.startsWith('Bearer')){
        try {
            token = authorization.split(' ')[1]
            const DecodedToken = jwt.verify(token, process.env.TOKEN)
            const id = DecodedToken.id
            req.user = await UserModal.findById(id).select('-password')
            next()
        } catch (error) {
            console.log("error")
            res.status(200).json({
                success:false,
                message : error.message
            })
        }
    }
    if(!token){
        res.status(200).json({
            success:false,
            message:"Un Authorized Access"
        })
    }
}

module.exports = CheckUserAuth