const http = require('http')
const app = require('./app.js')
const server = http.createServer(app)
const dotenv = require('dotenv').config()

server.listen (process.env.PORT, ()=>{
    console.log("server is running");
})