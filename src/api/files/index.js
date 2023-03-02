import Express from "express";
import multer from "multer";
import { extname } from "path";
import { saveBlogPostsCover } from "../../lib/fs-tools.js";

const filesRouter = Express.Router();

filesRouter.post("/:id", multer().single("cover"), async (req, res, next) => {
  try {
    const originalFileExtension = extname(req.file.originalname);
    const fileName = req.params.id + originalFileExtension;
    await saveBlogPostsCover(fileName, req.file.buffer);
    res.send({ message: "file uploaded" });
  } catch (error) {
    next(error);
  }
});

export default filesRouter;
