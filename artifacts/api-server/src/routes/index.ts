import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import rewardsRouter from "./rewards";
import claimsRouter from "./claims";
import ticketsRouter from "./tickets";
import notificationsRouter from "./notifications";
import announcementsRouter from "./announcements";
import statsRouter from "./stats";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(rewardsRouter);
router.use(claimsRouter);
router.use(ticketsRouter);
router.use(notificationsRouter);
router.use(announcementsRouter);
router.use(statsRouter);
router.use(adminRouter);

export default router;
