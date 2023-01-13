import jwt from "jsonwebtoken";

// Autorise uniquement l'accès à la page si l'utilisateur est un administrateur.
// Nécessite l'utilisation du middleware `loadUser`.
export function verificationUser(req, res, next) {
  // on fait appel a notre notre secret dans variable d'environnement depuis le fichier .env
  const { APP_TOKEN_SECRET } = process.env;

  // on recupere notre jeton JWT dans l'entete
  const token = req.session.token;

  // condition si pas de token
  if (!token) {
    res.redirect("*");
    return;
  }

  try {
    // si y'a un token on verifie le token

    const decodedToken = jwt.verify(token, APP_TOKEN_SECRET);

    console.log(decodedToken);

    // si id du user connecté
    if (decodedToken) {
      res.locals.foundUser = req.session.verifUser;

      // on passe a l'action suivante
      next();
    } else {
      // message en cas d'erreur
      console.log("Erreur Authentification Body Raw");
      throw "erreur identification userid";
    }
  } catch (err) {
    // resulat en cas de token invalide
    return res.status(401).send("Invalid Token");
  }
}
