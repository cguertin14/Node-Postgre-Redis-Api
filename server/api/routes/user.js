import UserController from '../controllers/userController';
import { bearer, login } from '../middlewares/authenticate';
import express from 'express';
import { catchAsyncErrors } from '../exceptions/routeErrorHandler';
const router = express.Router();

router.post('/login', login);

router.post('/', catchAsyncErrors(async (req, res) => {
    await new UserController(req, res).signUp();
}));

router.get('/me', bearer, catchAsyncErrors(async (req, res) => {
    await new UserController(req, res).me();
}));

router.delete('/logout', bearer, async (req, res) => {
    await new UserController(req, res).logOut();
});

router.post('/verifyemail', catchAsyncErrors(async (req, res) => {
    await new UserController(req, res).verifyEmail();
}));

router.post('/setlocale', catchAsyncErrors(async (req, res) => {
    await new UserController(req, res).setLocale(req.body.locale);
}));

router.post('/registerdevice', bearer, catchAsyncErrors(async (req, res) => {
    await new UserController(req, res).registerDevice();
}));

router.get('/dashboard', bearer, catchAsyncErrors(async (req, res) => {
    await new UserController(req, res).dashboard();
}));

router.get('/search/:searchValue', bearer, catchAsyncErrors(async (req, res) => {
    await new UserController(req, res).search(req.params.searchValue);
}));

router.get('/suggestions', bearer, catchAsyncErrors(async (req, res) => {
    await new UserController(req, res).searchSuggestions();
}));

router.post('/validatetoken', bearer, catchAsyncErrors(async (req, res) => {
    await new UserController(req, res).validateToken();
}));

router.post('/refreshtoken', catchAsyncErrors(async (req, res) => {
    await new UserController(req, res).refreshToken();
}));

router.put('/edit/email', bearer, catchAsyncErrors(async (req, res) => {
    await new UserController(req, res).changeEmail();
}));

router.put('/edit/password', bearer, catchAsyncErrors(async (req, res) => {
    await new UserController(req, res).changePassword();
}));

router.put('/edit', bearer, catchAsyncErrors(async (req, res) => {
    await new UserController(req, res).edit();
}));

export default router;