import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler";
import { sendSuccess } from "../utils/response";

export const handleUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new AppError("No file uploaded", 400);
        }

        // In a real application, upload to S3/Cloudinary and get URL.
        // For demo/phase 1, assume multer saved it to local public/uploads directory.
        // Let's create a faux URL
        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

        sendSuccess(res, { url: fileUrl }, "File uploaded successfully");
    } catch (err) {
        next(err);
    }
};
