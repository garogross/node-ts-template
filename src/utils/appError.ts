export interface IAppError extends Error {
    statusCode: number;
    status: string;
    isOptional: boolean;
}

export class AppError extends Error {
    statusCode: number;
    status: string;
    isOptional: boolean;

    constructor(message: string,statusCode?: number) {
        super(message)
        this.statusCode = statusCode || 500
        this. status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
        this.isOptional = true

        // add stack to error
        Error.captureStackTrace(this,this.constructor)
    }
}