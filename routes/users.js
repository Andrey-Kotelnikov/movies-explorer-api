const userRouter = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const { getUserMe, updateUser } = require("../controllers/users");

userRouter.get("/me", getUserMe);

userRouter.patch(
  "/me",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      email: Joi.string().required().email(),
    }),
  }),
  updateUser,
);

module.exports = userRouter;
