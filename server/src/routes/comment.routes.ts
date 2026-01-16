import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createComment, deleteComment, listComments } from '../controllers/comment.controller';

const router = express.Router();

router.use(authenticate);

router.get('/', listComments);
router.post('/', createComment);
router.delete('/:id', deleteComment);

export default router;

