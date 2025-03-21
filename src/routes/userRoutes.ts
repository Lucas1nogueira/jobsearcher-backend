import { Router } from "express";
import * as userController from "../controllers/userController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = Router();

router.get("/users", userController.getUsers);
router.get("/users/:id", userController.getUser);
router.delete("/users/:id", authenticateJWT, userController.deleteUser);
router.patch("/users/:id", authenticateJWT, userController.updateUser);

export default router;
