import ImageController from '../controllers/imageController';
import express from 'express';
import { bearer } from '../middlewares/authenticate';
const router = express.Router();

router.get('/upload', bearer, (req, res) => {
    new ImageController(req, res).upload();
});

export default router;