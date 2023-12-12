const movieRouter = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require("../controllers/movies");

const urlRegex = require("../utils/utils");

movieRouter.get("/", getMovies);

movieRouter.post(
  "/",
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().pattern(urlRegex),
      trailerLink: Joi.string().required().pattern(urlRegex),
      thumbnail: Joi.string().required().pattern(urlRegex),
      movieId: Joi.number().required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    }),
  }),
  createMovie,
);

movieRouter.delete(
  "/:movieId",
  celebrate({
    params: Joi.object().keys({
      movieId: Joi.string().length(24).hex().required(),
    }),
  }),
  deleteMovie,
);

module.exports = movieRouter;
