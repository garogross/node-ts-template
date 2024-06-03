import {catchAsync} from "../utils/catchAsync.js";
import {AppError} from "../utils/appError.js";
import {ApiFeatures} from "../utils/apiFeatures.js";
import mongoose from "mongoose";
import express, {Request,Response,NextFunction} from "express";
import {ParsedQs} from "qs";
import {IQueryString} from "../interfaces/IQueryString";

export class HandlerFactory {
    Model: mongoose.Model<any>;
    docName: string;

    constructor(Model: mongoose.Model<any>, docName: string) {
        this.Model = Model
        this.docName = docName
    }

    create() {
        const {Model} = this
        return catchAsync(async function (req, res: express.Response) {
            const newDoc = await Model.create(req.body)
            res.send({
                status: 'success',
                data: newDoc
            })
        })
    }

    updateOne() {

        const {Model, docName} = this
        return catchAsync(async function (req, res, next) {
            const resData = req.body as typeof req.body & {
                photo: string
            }
            if (req.file) resData.photo = req.file.filename
            const doc = await Model.findByIdAndUpdate(req.params.id || req.user.id, resData, {
                new: true,
                runValidators: true
            })

            if (!doc) {
                return next(new AppError(`No ${docName} found with that id`, 404))
            }

            res.send({
                status: 'success',
                data: doc
            })
        })
    }

    deleteOne() {
        const {Model, docName} = this
        return catchAsync(async function (req, res, next) {
            const doc = await Model.findByIdAndDelete(req.params.id)
            if (!doc) {
                return next(new AppError(`No ${docName} found with that id`, 404))
            }

            res.status(204).send({
                status: 'success',
                data: doc
            })
        })

    }

    deleteAll() {
        const {Model} = this
        return catchAsync(async (req, res) => {
            await Model.deleteMany()
            res.status(200).send({
                status: 'success',
                message: 'cleared'
            })
        })
    }

    getMe() {
        return function (req: Request, _: Response, next: NextFunction) {
            req.params.id = req.user.id
            next()
        }
    }

    getOne(populateOptions?: string | string[]) {
        const {Model, docName} = this
        return catchAsync(async (req, res, next) => {
            let query = Model.findById(req.params.id)

            if (populateOptions) {
                query = query.populate(populateOptions)
            }
            const doc = await query


            if (!doc) {
                return next(new AppError(`No ${docName} found with that id`, 404))
            }

            res.send({
                status: 'success',
                data: doc
            })
        })
    }

    getAll() {
        const {Model} = this
        return catchAsync(async (req, res) => {
            let filter = {}
            const q = req.query as ParsedQs
            const features = new ApiFeatures(Model.find(filter), req.query as IQueryString)
                .filter()
                .sort()
                .paginate()

            const doc = await features.query
            res.send({
                status: 'success',
                result: doc.length,
                data: doc
            })
        })
    }
}