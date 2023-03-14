import Express from "express";
import multer from "multer";
import createHttpError from "http-errors";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { pipeline } from "stream";
import { getAuthorsJSONReadableStream } from "../../lib/fs-tools.js";
import { Transform } from "@json2csv/node";
import blogPostModel from "../blogPosts/blogPostModel.js";

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "strive-blog/covers",
    },
  }),
}).single("cover");

const filesRouter = Express.Router();

filesRouter.put("/cover/:id", cloudinaryUploader, async (req, res, next) => {
  try {
    const updatedBlogPost = await blogPostModel.findByIdAndUpdate(
      req.params.id,
      { cover: req.file.path },
      { new: true, runValidators: true }
    );
    console.log("updatedBlogPost", updatedBlogPost);

    if (updatedBlogPost) {
      res.send(updatedBlogPost);
    } else {
      next(
        createHttpError(404, `Blog post with id ${res.params.id} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

filesRouter.get("/csv", (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=authors.csv");
    const source = getAuthorsJSONReadableStream();
    const transform = new Transform({
      fields: ["name", "surname", "email", "dataOfBirth"],
    });
    const destination = res;
    pipeline(source, transform, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    next(error);
  }
});

export default filesRouter;
