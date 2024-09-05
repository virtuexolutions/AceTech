const express = require('express')
const app = express()
const db = require('./config/connectDb.js')
const cors = require('cors')
const bodyParser = require('body-parser')
const UserRoute = require('./api/routes/UserRoute.js')
db()    

app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json()) 

//Routes
app.use('/user',UserRoute)
// app.use('/uploads', express.static('uploads'));

// Bad Request
app.use((req,res,next)=>{
    res.status(400).json({
        message : 'Bad request.'
    })
})

module.exports = app