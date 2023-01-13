import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.modele.js";
import { sha256 } from "../utils/hashCode.js";

export async function getHomePageController(req, res) {
  res.render("Home/home");
}

export async function getInscriptionPageController(req, res) {
  res.render("Inscription/inscription");
}

export function getLoginPageController(req, res) {
  res.render("Login/connexion");
}

export async function getDashboardPageController(req, res) {
  res.render("Dashboard/dashboard", { foundUser: req.session.user });
}

export function LogoutUserController(req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
}
//fonction d'affichage d'un ticket unique associés à un user
export function getNotFoundPage(req, res) {
  try {
    res.send(
      `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Page Introuvable</title>
      </head>
      <body>
         <h1>Page introuvable</h1>
        <p><a href="/">« Retour</a></p>
      </body>
    </html>`
    );
  } catch (err) {
    // sinon on retourne le message d'erreur
    return res.send(err);
  }
}

export function getDeconnexionController(req, res) {
  try {
    req.session.user = "";
    res.redirect("/");
  } catch (err) {
    // sinon on retourne le message d'erreur
    return res.send(err);
  }
}

export async function createUserController(req, res) {
  // on recupere les saisie
  const { firstName, lastName, email, password, passwordConfirm } = req.body;

  // pour verifier la valider de notre mail
  const expressionReguliere =
    /^(([^<>()[]\.,;:s@]+(.[^<>()[]\.,;:s@]+)*)|(.+))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/;

  // variable de gestion des erreurs sur les champs saisis
  let errors = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirm: "",
  };

  // Fields check
  if (!firstName || firstName.toString().trim() === "") {
    // message d'erreur si champ vide
    errors.firstName = "le champs firstName est obligatoire";
    res.json({ errors });
    return;
  }

  if (!lastName || lastName.toString().trim() === "") {
    // message d'erreur si champ vide
    errors.lastName = "le champs lastName est obligatoire";
    res.json({ errors });
    return;
  }

  if (!email || email.toString().trim() === "") {
    // message d'erreur si champ vide
    errors.email = "le champs email est obligatoire";
    res.json({ errors });
    return;
  }

  if (!expressionReguliere.test(email)) {
    // message si email incorrect
    errors.email = "email incorrect";
    res.json({ errors });
    return;
  }

  if (!password || password.toString().trim() === "") {
    // message d'erreur si champ vide
    errors.password = "le champs password est obligatoire";
    res.json({ errors });
    return;
  }

  if (password.length < 6) {
    // message si mot de passe trop court(donc incorrect)
    errors.password = "mot de passe trop court";
    res.json({ errors });
    return;
  }

  if (!passwordConfirm || passwordConfirm.toString().trim() === "") {
    // message d'erreur si champ vide
    errors.passwordConfirm = "le champs passwordConfirm est obligatoire";
    res.json({ errors });
    return;
  }

  if (errors.length > 0) {
    throw new Error(errors.join("<br>"));
  }

  // methode de comparasion des mots de passe saissis
  if (password !== passwordConfirm) {
    errors.passwordConfirm = "mot de passe non identique";
    res.json({ errors });
    return;
  }

  // verifie si utilisateur existe deja
  const foundUser = await UserModel.verifUserByMail(email);

  // console.log(foundUser);
  if (foundUser) {
    errors.email = "email existe déjà";
    res.json({ errors });
    return;
  }

  try {
    // si tous les contrôle sont vérifiés,
    // on crée un utilisateur dans la base de donnée
    const newUser = await UserModel.createUser(
      firstName,
      lastName,
      email,
      sha256(password),
      passwordConfirm
    );

    if (newUser) {
      req.flash(
        "success",
        `Inscription réussie ! Bienvenue sur l'application ${newUser.firstName}<br>Vous pouvez maintenant <a href="/connexion">vous connecter</a>`
      );
      res.redirect("/");
    }
  } catch ({ message: errorMessage }) {
    return res
      .status(400)
      .render("inscription", { errorMessage, values: req.body });
  }
}

// la fonction qui fait appel a la methode de vérification de login d'un user
// depuis le modele
export async function LoginUserController(req, res) {
  const { email, password } = req.body;
  // console.log(req.body);

  // on fait appel à la variable d'environnement depuis le fichier .env
  // pour la creation de notre token
  const { APP_TOKEN_SECRET } = process.env;

  // variable de gestion des erreurs sur les champs saisis
  let errors = { email: "", password: "", message: "" };

  // fonction de creation de jeton pour l'authentification
  // en utilisant L'id du user et la clé secrète de APP_TOKEN_SECRET
  const createToken = (email) => {
    return jwt.sign({ email }, APP_TOKEN_SECRET, {
      // durer de vie du jeton
      expiresIn: "45m",
    });
  };

  // les differentes contrôle a faire avant la connexion d'un user
  // cela evite que le serveur il crache

  if (!email) {
    // message d'erreur si champ vide
    errors.email = "le champs email est obligatoire";
    res.json({ errors });
    return;
  }

  if (!password) {
    // message d'erreur si champ vide
    errors.password = "le champs password est obligatoire";
    res.json({ errors });
    return;
  }

  try {
    // ci-dessous on verifie si les differents champs sont correctes
    const verifUser = await UserModel.verifAuthentification(email, password);
    console.log(verifUser);

    const token = createToken(verifUser.email);

    console.log(token);
    if (!verifUser) {
      // message si email ne se trouve pas dans la base de donnée
      errors.email = "Email ou mot de passe incorrect";
      errors.message = " Votre compte n'a pas été trouvé dans la base donnée";
      res.json({ errors });
      return;
    }

    if (verifUser) {
      // Saves user in session
      req.session.user = verifUser;

      req.session.token = token;

      req.flash(
        "success",
        `Connexion réussie ! Heureux de vous revoir ${verifUser.firstName}`
      );
      res.redirect("/dashboard");
      return;
    }
  } catch (error) {
    req.flash("error", `Connexion impossible ! ${error.message}`);
    res.redirect("/connexion");
  }
}
