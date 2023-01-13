import { Router } from "express";

import {
  getHomePageController,
  getInscriptionPageController,
  getLoginPageController,
  createUserController,
  getNotFoundPage,
  LoginUserController,
  getDashboardPageController,
  LogoutUserController,
} from "../controllers/user.controller.js";

import { verificationUser } from "../middlewares/middleware.js";

const router = Router();

router.get("/", getHomePageController);

router.get("/inscription", getInscriptionPageController);

router.get("/connexion", getLoginPageController);

router.get("/dashboard", verificationUser, getDashboardPageController);

router.get("/deconnexion", LogoutUserController);

router.post("/inscription", createUserController, getDashboardPageController);

router.post("/connexion", LoginUserController);

router.get("*", getNotFoundPage);

export default router;
