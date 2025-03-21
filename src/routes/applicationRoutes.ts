import { application, Router } from "express";
import * as applicationController from "../controllers/applicationController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = Router();

router.post(
  "/applications",
  authenticateJWT,
  applicationController.saveApplication
);
router.get("/applications", applicationController.getApplications);
router.get("/applications/:id", applicationController.getApplication);
router.get(
  "/applicationsByUser",
  authenticateJWT,
  applicationController.getApplicationsByUser
);
router.delete(
  "/applications/:id",
  authenticateJWT,
  applicationController.deleteApplication
);

export default router;
