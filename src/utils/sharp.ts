import sharp from "sharp";
import * as Buffer from "node:buffer";

export const resizeImage = async (buffer: Buffer,toFile: string,sizes: [number,number] = [500,500]) => {
    await sharp(buffer)
        .resize(sizes[0],sizes[1])
        .toFormat("jpeg")
        .jpeg({quality: 90})
        .toFile(toFile)
}