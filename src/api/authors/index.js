import Express from "express";
import uniqid from "uniqid";
import { getAuthors, writeAuthors } from "../../lib/fs-tools.js";
import { sendsRegistrationEmail } from "../../lib/email-tools.js";

const authorsRouter = Express.Router();

authorsRouter.post("/", async (request, response, next) => {
  try {
    const newAuthor = {
      ...request.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: uniqid(),
    };
    const authorsArray = await getAuthors();

    const found = authorsArray.find(
      (author) => author.email === request.body.email
    );
    if (found === undefined) {
      authorsArray.push(newAuthor);
      await writeAuthors(authorsArray);
      response.status(201).send({ id: newAuthor.id });
    } else {
      response.status(400).send("User with that email already exists");
    }
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/", async (request, response, next) => {
  try {
    const authorsArray = await getAuthors();
    response.send(authorsArray);
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/:id", async (request, response, next) => {
  try {
    const authorsArray = await getAuthors();
    const author = authorsArray.find(
      (author) => author.id === request.params.id
    );
    response.send(author);
  } catch (error) {
    next(error);
  }
});

authorsRouter.put("/:id", async (request, response, next) => {
  try {
    const authorsArray = await getAuthors();
    const index = authorsArray.findIndex(
      (author) => author.id === request.params.id
    );
    const oldAuthor = authorsArray[index];
    const updatedUser = {
      ...oldAuthor,
      ...request.body,
      updatedAt: new Date(),
    };
    authorsArray[index] = updatedUser;
    await writeAuthors(authorsArray);
    response.send(updatedUser);
  } catch (error) {
    next(error);
  }
});

authorsRouter.delete("/:id", async (request, response, next) => {
  try {
    const authorsArray = await getAuthors();
    const remainingAuthors = authorsArray.filter(
      (author) => author.id !== request.params.id
    );
    await writeAuthors(remainingAuthors);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

authorsRouter.post("/sendMail", async (req, res, next) => {
  try {
    console.log("sendMail");
    const email = req.body.email;
    await sendsRegistrationEmail(email);
    res.send();
  } catch (error) {
    next(error);
  }
});

export default authorsRouter;
