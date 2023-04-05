import createHttpError from "http-errors";
import blogPostModel from "../../api/blogPosts/blogPostModel.js";

export const adminOrOwnerMiddleware = async (req, res, next) => {
  const authorId = req.author._id;
  const blogpost = await blogPostModel.findById(req.params.id);
  const blogFromAuthor = blogpost.author.authorID.includes(authorId);

  if (blogFromAuthor || req.author.role === "Admin") {
    next();
  } else {
    next(
      createHttpError(
        401,
        `You have to be an admin or author of this post to edit it`
      )
    );
  }
};
