import bcrypt from "bcrypt";
import crypto from "crypto";

const salt = 10;
// fonction d'achage du mot de passe
export const hashPassword = (newPassword) => {
  //   remplace le mot de passe par un mot de passe crypter
  const NewPasswordHash = bcrypt.hashSync(newPassword, salt);
  return NewPasswordHash;
};

// fonction d'achage du mot de passe
export function sha256(newPassword, secret = process.env.APP_HASH_SALT) {
  return crypto.createHmac("sha256", secret).update(newPassword).digest("hex");
}
