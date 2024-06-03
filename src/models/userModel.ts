import mongoose, {Model,Document} from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs"
import * as crypto from "crypto";
import {createHashedToken} from "../utils/crypto.js";
import {UserRoles, userRoles} from "../constants/UserRoles.js";

export interface UserDocument extends Document {
    name: string,
    email: string,
    photo: string,
    role: UserRoles,
    password: string | undefined,
    passwordConfirm: string | undefined,
    passwordChangedAt: Date,
    passwordResetToken: Date | undefined,
    passwordResetExpires: Date | undefined,
    active: boolean,

    //
    createPasswordResetToken: () => string,
    changedPasswordAfter: (time: number) => boolean,
    correctPassword: (candidatePassword: string,userPassword: string) => Promise<boolean>
}

interface UserModel extends Model<UserDocument> {}

export const userSchema = new mongoose.Schema<UserDocument, UserModel>({
    name: {
        type: String,
        required: [true,"Name is required"]
    },
    email: {
        type: String,
        unique: true,
        required: [true,"Email is required"],
        validate: [validator.isEmail,"Please write a correct email"]
    },
    photo: String,
    role: {
        type: String,
        enum: Object.values(userRoles),
        default: UserRoles.user
    },
    password: {
        type: String,
        required: [true,'Password is required'],
        minlength: 5,
        select: false,
    },
    passwordConfirm : {
        type: String,
        required: [true,'Password Confirm is required'],
        minlength: 5,
        validate: {
            validator: function(this: UserDocument,val: string): boolean {
                return val === this.password
            },
            message: 'Passwords are not equal'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

// hash password
userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next()
    if(this.password) {
        this.password = await bcrypt.hash(this.password,16)
        this.passwordConfirm = undefined
    }
    next()
})

//
userSchema.pre('save', function (next) {
    if(!this.isModified('password') || this.isNew) return next()
    console.log('is changing',!this.isModified('password'),this.isNew)
    this.passwordChangedAt = new Date(Date.now() - 1000)
    next()
})

userSchema.pre(/^find/,function(this,next){
    if("find" in this) {
        this.find({active: {$ne: false}})
    }
    next()
})


userSchema.methods.correctPassword = async (candidatePassword: string,userPassword: string) => {
    return await bcrypt.compare(candidatePassword,userPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
    if(this.passwordChangedAt) {
        const changedTimestamp = parseInt((this.passwordChangedAt.getTime() / 1000).toString(),10)

        return  JWTTimestamp < changedTimestamp
    }

    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex")

    this.passwordResetToken = createHashedToken(resetToken)

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000

    return resetToken;
}

export const User = mongoose.model('User',userSchema)