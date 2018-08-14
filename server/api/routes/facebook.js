import express from 'express';
import FacebookController from '../controllers/facebookController';
import { bearer } from '../middlewares/authenticate';
import { catchAsyncErrors } from '../exceptions/routeErrorHandler';
const router = express.Router();

router.post('/login', catchAsyncErrors(async (req, res) => {
    await new FacebookController(req, res).login();
}));

router.post('/signup', catchAsyncErrors(async (req, res) => {
    await new FacebookController(req, res).signUp();
}));

router.put('/link', bearer, catchAsyncErrors(async (req, res) => {
    await new FacebookController(req, res).linkAccount();
}));

export default router;