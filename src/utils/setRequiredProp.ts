export const setRequiredProp = function (name: string) {
    return {required: [true, `The ${name} is required`]}
}