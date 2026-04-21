import { FastifyRequest, FastifyReply } from "fastify";
import path from "path";
import fs from "fs";
import { AppError } from "../middleware/errorHandler";

export const handleUpload = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const file = await request.file();

        if (!file) {
            throw new AppError("No file uploaded", 400);
        }

        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const userId = (request as any).user?.id || "anonymous";
        const fileType = (request.params as any).type || "file";
        const filename = `${userId}_${fileType}_${uniqueSuffix}${path.extname(file.filename)}`;
        const filepath = path.join(uploadDir, filename);

        // Save file
        const fileBuffer = await file.toBuffer();
        fs.writeFileSync(filepath, fileBuffer);

        // Generate file URL
        const fileUrl = `/uploads/${filename}`;

        return reply.send({ success: true, data: { url: fileUrl }, message: "File uploaded successfully" });
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError("File upload failed", 500);
    }
};
