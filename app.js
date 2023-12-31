const express = require("express");
const mongooose = require("mongoose");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const { errors } = require("celebrate");
const cookieParser = require("cookie-parser");
const { rateLimit } = require("express-rate-limit");
const cors = require("cors");

const userRouter = require("./routes/users");
const movieRouter = require("./routes/movies");
const { login, createUser } = require("./controllers/users");
const auth = require("./middlewares/auth");
const {
  validationSignin,
  validationSignup,
} = require("./middlewares/joi-validation");
const errorHandler = require("./middlewares/error-handler");
const NotFoundError = require("./errors/not-found-error");
const { PORT, DB_URL } = require("./utils/app.config");

const { requestLogger, errorLogger } = require("./middlewares/logger");

const app = express();

// Подключение к БД
mongooose
  .connect(DB_URL, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Подключено к mongoDB");
  });

app.use(cookieParser()); // Сборщик кук
app.use(bodyParser.json()); // Используем сборщик данных
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet()); // Используем защиту

app.use(requestLogger); // подключаем логгер запросов

app.use(
  rateLimit({
    // Ограничитель кол-ва запросов
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);

/* app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000/");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  next();
}); */

// app.use(cors());

const ENV = "http://localhost:3000";

app.use(
  cors({
    origin: true,
    credentials: true,
    ENV,
  }),
);

/* app.use(
  cors({
    origin: ["http://localhost:3000", "movier.nomoredomainsrocks.ru"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  }),
); */

/*
// Проверит приложение на возобновление после ошибки
app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Сервер сейчас упадёт");
  }, 0);
});
*/
app.post("/signin", validationSignin, login); // Роут логина
app.post("/signup", validationSignup, createUser); // Роут регистрации

app.use("/users", auth, userRouter); // Настраиваем роуты для users
app.use("/movies", auth, movieRouter); // Настраиваем роуты для movies
app.get("/signout", auth, (req, res) => {
  res.clearCookie("jwt").send({ message: "Выход из аккаунта" });
});
app.use("*", auth, (req, res, next) =>
  // Остальные пути
  next(new NotFoundError("Неверный путь")),
);

app.use(errorLogger); // подключаем логгер ошибок

// Обработчик ошибок приходящих от celebrate
app.use(errors());

// Обработчик неотловленных ошибок //
/* process.on('uncaughtException', (err, origin) => {
  console.log(`${origin} ${err.name} c текстом ${err.message} не была обработана. Обратите внимание!`);
}) */

// Централизованный обработчик ошибок
app.use(errorHandler);

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});
