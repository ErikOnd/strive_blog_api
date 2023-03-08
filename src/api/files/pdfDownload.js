import Express from "express";
import { getBlogPosts } from "../../lib/fs-tools.js";
import { getPDFReadableStream } from "../../lib/pdf-tools.js";
import { pipeline } from "stream";

const pdfDownloadRouter = Express.Router();

pdfDownloadRouter.get("/pdf/:id", async (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=blogPost.pdf");

    const blogPosts = await getBlogPosts();
    const blogPost = blogPosts.find(
      (blogPost) => blogPost.id === req.params.id
    );
    const source = await getPDFReadableStream(blogPost);
    const destination = res;

    pipeline(source, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    next(error);
  }
});

export default pdfDownloadRouter;
