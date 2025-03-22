import { Router } from "express";
import * as jobController from "../controllers/jobController";

const router = Router();

router.post("/jobs", jobController.saveJob);
router.get("/jobs", jobController.getJobs);
router.get("/jobs/:id", jobController.getJob);
router.delete("/jobs/:id", jobController.deleteJob);
router.patch("/jobs/:id", jobController.updateJob);

export default router;
