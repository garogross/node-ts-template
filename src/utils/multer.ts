import multer from "multer";
import e from "express"
import { ParamsDictionary } from "express-serve-static-core"; // Import ParamsDictionary and ParsedQs
import { ParsedQs } from "qs"; // Import ParsedQs from "qs"

import {AppError} from "./appError.js";

const multerStorage = multer.memoryStorage()


const multerFilter = (
    _: e.Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    file:  Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if(file.mimetype.startsWith("image")) {
        cb(null,true)
    } else {
        cb(new AppError("Please upload only images",400))
    }
}

export const uploadImage = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})