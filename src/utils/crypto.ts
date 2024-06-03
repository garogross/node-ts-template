import crypto from "crypto";

export const createHashedToken = (token: string) => {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest("hex")
}