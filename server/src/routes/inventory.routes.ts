import { Router } from 'express';
import inventoryController from '../controllers/inventory.controller';
import { Role } from "../config/permissions";
import { authenticate as protect, authorize } from '../middleware/auth.middleware';

const router = Router();

// Tüm rotalar korumalı
router.use(protect);

// Category Routes
router.post('/categories', authorize(Role.DEPO_SORUMLUSU), inventoryController.createCategory);
router.get('/categories', inventoryController.getCategories);
router.put('/categories/:id', authorize(Role.DEPO_SORUMLUSU), inventoryController.updateCategory);
router.delete('/categories/:id', authorize(Role.DEPO_SORUMLUSU), inventoryController.deleteCategory);

// Location Routes
router.post('/locations', authorize(Role.DEPO_SORUMLUSU), inventoryController.createLocation);
router.get('/locations', inventoryController.getLocations);

// Item (Equipment) Routes
router.post('/items', authorize(Role.DEPO_SORUMLUSU), inventoryController.createItem.bind(inventoryController));
router.get('/items/:id', inventoryController.getItem.bind(inventoryController));
router.get('/items', inventoryController.getItems);

// Operations Routes
router.post('/assign-to-project', authorize(Role.DEPO_SORUMLUSU), inventoryController.assignToProject.bind(inventoryController));
router.post('/return-to-warehouse', authorize(Role.DEPO_SORUMLUSU), inventoryController.returnToWarehouse.bind(inventoryController));
router.post('/items/:id/maintenance', authorize(Role.DEPO_SORUMLUSU), inventoryController.sendToMaintenance.bind(inventoryController));

// History Route
router.get('/history/:id', inventoryController.getHistory);

// Update Item Route
router.put('/items/:id', authorize(Role.DEPO_SORUMLUSU), inventoryController.updateItem.bind(inventoryController));

// Delete Item Route
router.delete('/items/:id', authorize(Role.DEPO_SORUMLUSU), inventoryController.deleteItem.bind(inventoryController));

export default router;
