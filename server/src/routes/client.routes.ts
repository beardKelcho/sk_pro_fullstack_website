import express from 'express';
import { getClients, createClient, getClientById, updateClient, deleteClient } from '../controllers/client.controller';
import { authenticate as protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getClients)
  .post(authorize('admin', 'manager'), createClient);

router.route('/:id')
  .get(getClientById)
  .put(authorize('admin', 'manager'), updateClient)
  .delete(authorize('admin'), deleteClient);

export default router;
