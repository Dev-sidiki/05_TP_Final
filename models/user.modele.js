import mongoose from "mongoose";
import { sha256 } from "../utils/hashCode.js";
// un modèle de creation d'un utilisateur
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

// question??
UserSchema.static("createUser", createUser);
UserSchema.static("verifUserByMail", verifUserByMail);
UserSchema.static("verifAuthentification", verifAuthentification);

// fonction d'inscription d'un nouveau utilisateur da la base de donneé
async function createUser(
  firstName,
  lastName,
  email,
  password,
  passwordConfirm
) {
  // on crée le user
  return await this.create({
    firstName,
    lastName,
    email,
    password,
    passwordConfirm,
  });
}

// methode de verifications des identifiant de l'utilisateur depuis la base de donnée
async function verifUserByMail(email) {
  const user = await this.findOne({ email: email });
  return user;
}

// methode de verifications des identifiant de l'utilisateur depuis la base de donnée
async function verifAuthentification(email, password) {
  const user = await this.findOne({ email: email, password: sha256(password) });
  return user;
}

// Récupération d'un Model mongoose sur la base du Schéma
const collectionName = "users";
export const UserModel = mongoose.model("User", UserSchema, collectionName);
