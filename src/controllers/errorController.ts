import {ErrorRequestHandler, Response} from "express";
import {AppError, IAppError} from "../utils/appError.js";
import {Error} from "mongoose";

type SendErrorFunc = (error: IAppError, res: Response) => void
type ReturnErrorFunc = (error: any) => Error

const sendErrDev:SendErrorFunc = (error, res) => {
    const {status,message,stack,statusCode} = error
    res.status(statusCode).json({
        status,
        message,
        stack,
        error,
    })
}

const sendErrProd:SendErrorFunc = (err, res) => {
    const {statusCode,status,message} = err
    res.status(statusCode).json({
        status,
        message,
    })
}

const handleCastErrorDb:ReturnErrorFunc = (err) => {
    const message = `invalid ${err.path}: ${err.value}`
    return new AppError(message, 400)
}

const handleDuplicateError:ReturnErrorFunc = (err) => {
    const entries = Object.entries(err.keyValue).map((item,_,arr) => `'${item[1]}' of field '${item[0]}'`).join(',')
    const message = `Duplicated value(s) ${entries}`
    return new AppError(message, 400)
}

const handleJWTError = () => new AppError('Invalid Token,please log in again',401)

const handleJWTExpiredError = () => new AppError('Your token has expired,please log in again')

export const globalErrorHandler:  ErrorRequestHandler = (err, req, res,next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        sendErrDev(err, res)
    } else if (process.env.NODE_ENV === 'production') {
        let error = {...err}
        if(error.name === 'CastError') error = handleCastErrorDb(error)
        if(error.code === 11000) error = handleDuplicateError(error)
        if(error.name === 'JsonWebTokenError') error = handleJWTError()
        if(error.name === 'TokenExpiredError') error = handleJWTExpiredError()
        sendErrProd(error, res)

    }
}
// duplicate error