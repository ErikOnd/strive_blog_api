import Express from "express";
import multer from "multer";
import { extname } from "path";
import { getBlogPosts, writeBlogPosts } from "../../lib/fs-tools.js";
import createHttpError from "http-errors";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { pipeline } from "stream";
import { getAuthorsJSONReadableStream } from "../../lib/fs-tools.js";
import { Transform } from "@json2csv/node";

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
    /*   console.log("IMG INFO:", req.file); */
    if (req.file !== undefined) {
      const originalFileExtension = extname(req.file.originalname);
      const fileName = req.params.id + originalFileExtension;
      const blogPostList = await getBlogPosts();
      const index = blogPostList.findIndex(
        (blogPost) => blogPost.id === req.params.id
      );
      if (index !== -1) {
        console.log(index);
        const oldBlogPost = blogPostList[index];
        const updatedBlogPost = {
          ...oldBlogPost,
          cover: req.file.path,
          updatedAt: new Date(),
        };
        blogPostList[index] = updatedBlogPost;
        await writeBlogPosts(blogPostList);
      }
      res.send({ message: "file uploaded" });
    } else {
      next(createHttpError(404, `The uploaded image is undefined`));
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
