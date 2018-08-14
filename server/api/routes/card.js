import CardController from '../controllers/cardController';
import { bearer } from '../middlewares/authenticate';
import express from 'express';
import { catchAsyncErrors } from '../exceptions/routeErrorHandler';
const router = express.Router();

router.get('/', bearer, catchAsyncErrors(async (req, res) => {
    await new CardController(req, res).index();
}));

router.get('/:id', bearer, catchAsyncErrors(async (req, res) => {
    await new CardController(req, res).get(req.params.id);
}));

router.post('/', bearer, catchAsyncErrors(async (req, res) => {
    await new CardController(req, res).store();
}));

router.delete('/:id', bearer, catchAsyncErrors(async (req, res) => {
    await new CardController(req, res).remove(req.params.id);
}));

router.put('/setdefault/:id', bearer, catchAsyncErrors(async (req, res) => {
    await new CardController(req, res).setDefaultCard(req.params.id);
}));

export default router;