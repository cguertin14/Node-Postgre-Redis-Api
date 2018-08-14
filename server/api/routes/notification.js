import NotificationController from '../controllers/notificationController';
import { bearer } from '../middlewares/authenticate';
import express from 'express';
import { catchAsyncErrors } from '../exceptions/routeErrorHandler';
const router = express.Router();

router.get('/', bearer, catchAsyncErrors(async (req, res) => {
	await new NotificationController(req, res).index();
}));

router.delete('/clear', bearer, catchAsyncErrors(async (req, res) => {
	await new NotificationController(req, res).clear();
}));

router.put('/see', bearer, catchAsyncErrors(async (req, res) => {
	await new NotificationController(req, res).see();
}));

router.get('/unseen', bearer, catchAsyncErrors(async (req, res) => {
	await new NotificationController(req, res).unseen();
}));

export default router;