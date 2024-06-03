import  {NextFunction,Request,Response} from "express";

type AsyncFuncType<T> = (req: Request, res: Response, next: NextFunction) => T


export const catchAsync = (fn: AsyncFuncType<Promise<void>>) => {
    const f: AsyncFuncType<void> = (req,res,next) => {
        fn(req,res,next).catch(next)
    }
    return f
}