import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticate } from "../middleware/auth";
import { roleGuard } from "../middleware/roleGuard";
import { handleUpload } from "../controllers/upload.controller";

const router: Router = Router();

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, req.user!.id + "_" + req.params.type + "_" + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for video support
});

router.use(authenticate, roleGuard("PANDIT"));

router.post("/:type", upload.single("file"), handleUpload);

export default router;
