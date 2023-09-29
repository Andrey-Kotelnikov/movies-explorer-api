const Movie = require("../models/movie");
// const user = require('../models/user')

const ValidationError = require("../errors/validation-error");
const NotFoundError = require("../errors/not-found-error");
const AccessError = require("../errors/access-error");

// Получение всех сохраненных пользователем фильмов
module.exports.getMovies = (req, res, next) => {
  const { user } = req;
  Movie.find({ owner: user })
    .then((movies) => res.send(movies))
    .catch(next);
};

// Создание фильма
module.exports.createMovie = (req, res, next) => {
  // const { name, link } = req.body;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user,
  })
    .then((movie) => res.status(201).send(movie))
    .catch((err) => {
      console.log(err);
      if (err.name === "ValidationError") {
        next(
          new ValidationError(
            `${Object.values(err.errors)
              .map((error) => error.message)
              .join(", ")}`,
          ),
        );
        return;
      }
      next(err);
    });
};

// Удаление сохраненного фильма по id
module.exports.deleteMovie = (req, res, next) => {
  const { _id } = req.user;
  Movie.findOne({ _id: req.params.movieId })
    .orFail(new NotFoundError("Фильм не найден"))
    .then((movie) => {
      console.log(`создатель фильма: ${movie.owner._id}`);
      console.log(`твой id: ${req.user._id}`);
      if (!movie.owner.equals(_id)) {
        throw new AccessError("Нельзя удалять фильмы других пользователей");
      }
      Movie.deleteOne(movie)
        .then(() => res.send({ data: movie }))
        .catch(next);
    })
    .catch((err) => {
      console.log(err);
      if (err.name === "CastError") {
        next(new ValidationError("Некорректный id"));
        return;
      }
      next(err);
    });
};
