import dotenv from "dotenv";
import {app} from "./app.js";
import mongoose from "mongoose";

dotenv.config({path: './config.env'})

process.on('uncaughtException',(err) => {
    process.exit(1)
})


const db = (process.env.DATABASE as string).replace('<PASSWORD>',(process.env.PASSWORD as string))


mongoose.connect(db).then((con) => {
    console.log('db connected')
}).catch(err => console.log(err))

const port = process.env.PORT || 5000
const server = app.listen(port,() => console.log(`App is running on port ${port}`))

process.on('unhandledRejection',(err) => {
    server.close(() => {
        process.exit(1)
    })
})

