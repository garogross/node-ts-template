import {catchAsync} from "../utils/catchAsync.js";
import {AppError} from "../utils/appError.js";
import * as util from "util";
import jwt from "jsonwebtoken";
import {User, UserDocument} from "../models/userModel.js";
import {UserRoles} from "../constants/UserRoles";
import {Request,Response,NextFunction} from "express";



export const protect = catchAsync(async (req:Request, res, next) => {
    const {authorization} = req.headers
    let token = ''
    if (authorization && authorization.startsWith('Bearer')) {
        token = authorization.split(' ')[1]
    }
    if (!token) {
        return next(new AppError('You are not logged in please log in to get access', 401))
    }
    if (process.env.JWT_SECRET) {
    }

// @ts-ignore
    const decoded: UserDocument & {iat: number} = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET || "1111")

    const freshUser = await User.findById(decoded.id)

    if (!freshUser) {
        return next(new AppError('The user belonging to this token mo longer exist', 401))
    }

    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password,please log in again'))
    }
    req.user = freshUser
    next()
})

export const restrictTo = (...roles: UserRoles[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user && !roles.includes(req.user.role)) {
            return next(new AppError(`You don't have permission to perform this action`, 403))
        }
        next()
    }
}