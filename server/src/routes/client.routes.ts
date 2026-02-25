import express from 'express';
import { getClients, createClient, getClientById, updateClient, deleteClient } from '../controllers/client.controller';
import { Role } from "../config/permissions";
import { authenticate as protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getClients)
  .post(authorize(Role.PROJE_YONETICISI), createClient);

router.route('/:id')
  .get(getClientById)
  .put(authorize(Role.PROJE_YONETICISI), updateClient)
  .delete(authorize(Role.PROJE_YONETICISI), deleteClient);

export default router;
