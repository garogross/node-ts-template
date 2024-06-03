import * as express from 'express';
import {MulterRequest} from "../../interfaces/MulterRequest";
import {UserDocument} from "../../models/userModel";

declare global {
    namespace Express {
        interface Request  extends Request {
            user: UserDocument,
            file:  Express.Multer.File,
        }
    }
}
