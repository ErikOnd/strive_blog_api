import Express from "express";
import createHttpError from "http-errors";
import { checkBlogPostSchema, triggerBadRequest } from "./validation.js";
import BlogPostModel from "./blogPostModel.js";
import AuthorsModel from "../authors/authorsModel.js";
import q2m from "query-to-mongo";

const blogPostsRouter = Express.Router();

blogPostsRouter.post(
  "/",
  checkBlogPostSchema,
  triggerBadRequest,
  async (request, response, next) => {
    try {
      const newBlogPost = new BlogPostModel(request.body);
      const authorOfPost = AuthorsModel.findById(request.body.author.authorId);
      if (!authorOfPost !== undefined) {
        const { _id } = await newBlogPost.save();
        await AuthorsModel.findByIdAndUpdate(
          request.body.author.authorId,
          { $push: { blogPosts: _id } },
          { new: true, runValidators: true }
        ),
          response.status(201).send({ _id });
      } else {
        res.stats(404).send("Author not found");
      }
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.get("/", async (request, response, next) => {
  try {
    const mongoQuery = q2m(request.query);
    console.log("mongoQuery:", mongoQuery);
    const blogPosts = await BlogPostModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort);
    //  .populate({ path: "authors" });
    const total = await BlogPostModel.countDocuments(mongoQuery.criteria);
    response.send({
      links: mongoQuery.links(`${process.env.FE_PROD_URL}/blogPosts`, total),
      total,
      numberOfPages: Math.ceil(total / mongoQuery.options.limit),
      blogPosts,
    });
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get("/:id", async (request, response, next) => {
  try {
    const blogPost = await BlogPostModel.findById(request.params.id);
    if (blogPost) {
      response.send(blogPost);
    } else {
      next(
        createHttpError(
          404,
          `Blog post with id ${request.params.id} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.put("/:id", async (request, response, next) => {
  try {
    const updatedBlogPost = await BlogPostModel.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true, runValidators: true }
    );
    console.log("updatedBlogPost", updatedBlogPost);

    if (updatedBlogPost) {
      response.send(updatedBlogPost);
    } else {
      next(
        createHttpError(
          404,
          `Blog post with id ${request.params.id} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.delete("/:id", async (request, response, next) => {
  try {
    const deletedBlogPost = await BlogPostModel.findByIdAndDelete(
      request.params.id
    );

    if (deletedBlogPost) {
      response.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `Blog post with id ${request.params.id} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

export default blogPostsRouter;

//------------------------------------------------- EMBEDDED COMMENT -------------------------------------------------

blogPostsRouter.post("/:blogPostId/comments", async (req, res, next) => {
  try {
    const updatedBlogPost = await BlogPostModel.findByIdAndUpdate(
      req.params.blogPostId,
      { $push: { comments: req.body } },
      { new: true, runValidators: true }
    );
    console.log("updatedBlogPost:", updatedBlogPost);
    console.log("req.body:", req.body);
    if (updatedBlogPost) {
      res.send(updatedBlogPost);
    } else {
      next(
        createHttpError(
          404,
          `BlogPost with id ${req.params.blogPostId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get("/:blogPostId/comments/", async (req, res, next) => {
  try {
    const blogPost = await BlogPostModel.findById(req.params.blogPostId);
    if (blogPost) {
      res.send(blogPost.comments);
    } else {
      next(
        createHttpError(404, `Comment with id ${req.body.commentId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogPost = await BlogPostModel.findById(req.params.blogPostId);
      if (blogPost) {
        const comment = blogPost.comments.find(
          (comment) => comment._id.toString() === req.params.commentId
        );

        if (comment) {
          res.send(comment);
        } else {
          next(
            createHttpError(
              404,
              `Comment with id ${req.params.productId} not found!`
            )
          );
        }
      } else {
        next(
          createHttpError(
            404,
            `blogPost with id ${req.params.blogPostId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.put(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogPost = await BlogPostModel.findById(req.params.blogPostId);
      if (blogPost) {
        const index = blogPost.comments.findIndex(
          (comment) => comment._id.toString() === req.params.commentId
        );

        if (index !== -1) {
          blogPost.comments[index] = {
            ...blogPost.comments[index].toObject(),
            ...req.body,
            updatedAt: new Date(),
          };
          await blogPost.save();
          res.send(blogPost);
        } else {
          next(
            createHttpError(
              404,
              `Comment with id ${req.params.commentId} not found!`
            )
          );
        }
      } else {
        next(
          createHttpError(
            404,
            `BlogPost with id ${req.params.blogPostId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.delete(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const updatedBlogPost = await BlogPostModel.findByIdAndUpdate(
        req.params.blogPostId,
        { $pull: { comments: { _id: req.params.commentId } } },
        { new: true, runValidators: true }
      );
      if (updatedBlogPost) {
        res.send(updatedBlogPost);
      } else {
        next(
          createHttpError(
            404,
            `BlogPost with id ${req.params.blogPostId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.post("/:blogPostId/like", async (req, res, next) => {
  try {
    const blogPost = await BlogPostModel.findById(req.params.blogPostId);

    if (blogPost) {
      const authorId = req.body.authorId;
      const result = await BlogPostModel.findByIdAndUpdate(
        req.params.blogPostId,
        { $addToSet: { likes: authorId } },
        { new: true, runValidators: true }
      );

      if (result.likes.length === blogPost.likes.length) {
        await BlogPostModel.findByIdAndUpdate(
          req.params.blogPostId,
          { $pull: { likes: { $in: [authorId] } } },
          { new: true, runValidators: true }
        );
        res.status(200).send({ like: "removed" });
      } else {
        res.status(201).send({ like: "added" });
      }
    } else {
      res.status(404).send("Blog post not found");
    }
  } catch (error) {
    next(error);
  }
});
