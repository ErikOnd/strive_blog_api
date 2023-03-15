import Express from "express";
import createHttpError from "http-errors";
import { checkCommentSchema, triggerBadRequest } from "./validation.js";
import CommentsModel from "./commentsModel.js";
import q2m from "query-to-mongo";

const commentsRouter = Express.Router();

commentsRouter.post(
  "/:blogPostId",
  checkCommentSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
    } catch (error) {
      next(error);
    }
  }
);

commentsRouter.get("/blogComments/:blogPostId", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const comments = await CommentsModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort);
    const total = await CommentsModel.countDocuments(mongoQuery.criteria);

    res.send({
      links: mongoQuery.links(
        `${process.env.FE_PROD_URL}/comments/blogComments/${request.params.blogPostId}`,
        total
      ),
      total,
      numberOfPages: Math.ceil(total / mongoQuery.options.limit),
      comments,
    });
  } catch (error) {
    next(error);
  }
});

commentsRouter.get("/:id", async (req, res, next) => {
  try {
    if (comment) {
      response.send(comment);
    } else {
      next(
        createHttpError(
          404,
          `Comment post with id ${request.params.id} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

commentsRouter.put("/:id", async (req, res, next) => {
  try {
    if (index !== -1) {
    } else {
      next(
        createHttpError(
          404,
          `Comment post with id ${request.params.id} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

commentsRouter.delete("/:id", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

export default commentsRouter;
