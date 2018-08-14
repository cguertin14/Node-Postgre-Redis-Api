import FriendController from '../controllers/friendController';
import { bearer } from '../middlewares/authenticate';
import express from 'express';
import { catchAsyncErrors } from '../exceptions/routeErrorHandler';
const router = express.Router();

router.get('/', bearer, catchAsyncErrors(async (req, res) => {
    // index de tous les amis du user.
    await new FriendController(req, res).index();
}));

router.post('/:id', bearer, catchAsyncErrors(async (req, res) => {
    // ajouter un ami
    await new FriendController(req, res).invite(req.params.id);
}));

router.get('/invites', bearer, catchAsyncErrors(async (req, res) => {
    await new FriendController(req, res).invites();
}));

router.get('/:id', bearer, catchAsyncErrors(async (req, res) => {
    // get ami par id
    await new FriendController(req, res).get(req.params.id);
}));

router.put('/:id', bearer, catchAsyncErrors(async (req, res) => {
    // accepter ou refuser un ami, fournir le status (0 ou 1) en body param
    await new FriendController(req, res).answer(req.params.id);
}));

router.delete('/:id', bearer, catchAsyncErrors(async (req, res) => {
    // supprimer un ami
    await new FriendController(req, res).remove(req.params.id);
}));

export default router;