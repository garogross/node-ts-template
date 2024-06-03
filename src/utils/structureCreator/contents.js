
export const fileCamel = 'fileCamel'
export const fileLower = 'fileLower'
export const crudText = 'CRUD_OPERATIONS'
export const appText = '// ROUTES'


export const controllerContent = `import {${fileCamel}} from "../models/${fileLower}Model.js";
import {HandlerFactory} from "./HandlerFactory.js";


const handleFactory = new HandlerFactory(${fileCamel}, '${fileLower}')
${crudText}
`

export const crudControllerContent = [`
export const create${fileCamel} = handleFactory.create()
export const getAll${fileCamel} = handleFactory.getAll()
export const getOne${fileCamel} = handleFactory.getOne()
export const update${fileCamel} = handleFactory.updateOne()
export const delete${fileCamel} = handleFactory.deleteOne()`]

export const routerContent = `import express from "express";
import {protect, restrictTo} from "../controllers/authController.js";
${crudText}

export const ${fileLower}Router = express.Router()

${crudText}

${fileLower}Router.use(protect)

// private routes


// ${fileLower}Router.use(restrictTo('user'))
// user restricted routes
`

export const crudRouterContents = [
    `import {
    create${fileCamel},
    delete${fileCamel},
    getAll${fileCamel},
    getOne${fileCamel},
    update${fileCamel}
} from "../controllers/${fileLower}Controller.js";`,
    `
${fileLower}Router.get('/', getAll${fileCamel})
${fileLower}Router.post('/create', create${fileCamel})

${fileLower}Router
    .route('/:id')
    .get(getOne${fileCamel})
    .patch(update${fileCamel})
    .delete(delete${fileCamel})
`
]

export const modelContent = `import mongoose from "mongoose";
import {setRequiredProp} from "../utils/setRequiredProp.js";

export interface ${fileCamel}Document extends Document {
    name: string,
}

interface ${fileCamel}Model extends Model<${fileCamel}Document> {}

const ${fileLower}Schema = new mongoose.Schema<${fileCamel}Document, ${fileCamel}Model>({
    name: {
        type: String,
        ...setRequiredProp('Name')
    },
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})


export const ${fileCamel} = mongoose.model('${fileCamel}',${fileLower}Schema)
`

export const appContents = [
    `import {${fileLower}Router} from "./src/routes/${fileLower}Routes.js";`,
    `app.use('/api/v1/${fileLower}s', ${fileLower}Router)`
]