import dotenv from "dotenv";
import session from "express-session";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routers/router.js";
import flash from "connect-flash";

// pour la gestion des variable d'environnement
dotenv.config({ path: "./config/.env" });

// on fait appel au variable d'environnement depuis le fichier .env
const { APP_PORT, APP_HOSTNAME, MONGODB_URI } = process.env;
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// cette ligne de code est proposé par le terminal
// pour supprimer le warning
mongoose.set("strictQuery", false);
// pour connecter son app a sa base de donnée mongo(titanic)
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true, // options qui évitent des warnings inutiles
  })
  .then(init); // Toutes les méthodes de mongoose renvoient des promesses

// Indique à Express le nom du package du moteur de template
app.set("view engine", "pug");
// ==========
// App middlewares
// ==========

//middlewares pour definir la session utilisateur
// (la session nous permet d'enregistrer des données)
app.use(
  session({
    name: "simple",
    secret: "simple",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: MONGODB_URI }),
    cookie: { maxAge: 24 * 3600 * 1000 }, // on détermine la durée de vie de la session
  })
);

// "flash" doit impérativement être défini APRÈS le middleware de session
// Un flash message survient à la suite d'une opération quelconque.
// Cela peut-être un message de succès, d'avertissement, d'information ou d'erreur.
app.use(flash());

app.use((req, res, next) => {
  res.locals.flash_message = req.flash("success_message");
  res.locals.messages = [];
  res.locals.foundUser = null;
  next();
});

app.use(express.static(path.join(__dirname, "public")));

// middlewares Pour récupérer les données POST en Express simplement
// Une fois que vous avez mis en place les deux ou une des méthodes ci-dessus vous pouvez les récupérer avec req.body sous forme d'un JSON
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// ==========
// App routers
// ==========

// middlewares pour la gestion des différentes routes
app.use("/", router);

// ==========
// Demarrage de l'application
// ==========

async function init() {
  console.log("Connexion à la base MongoDB initialisée!");

  app.listen(APP_PORT, () => {
    console.log(`App listening at http://${APP_HOSTNAME}:${APP_PORT}`);
  });
}
