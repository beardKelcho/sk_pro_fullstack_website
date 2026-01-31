import { Router } from 'express';
import inventoryController from '../controllers/inventory.controller';
import { authenticate as protect, authorize } from '../middleware/auth.middleware';

const router = Router();

// Tüm rotalar korumalı
router.use(protect);

// Category Routes
router.post('/categories', authorize('admin', 'editor'), inventoryController.createCategory);
router.get('/categories', inventoryController.getCategories);

// Location Routes
router.post('/locations', authorize('admin', 'editor'), inventoryController.createLocation);
router.get('/locations', inventoryController.getLocations);

// Item (Equipment) Routes
router.post('/items', authorize('admin', 'editor'), inventoryController.createItem.bind(inventoryController));
router.get('/items', inventoryController.getItems);

// Transfer Route
router.post('/transfer', authorize('admin', 'editor'), inventoryController.transferStock.bind(inventoryController));

// History Route
router.get('/history/:id', inventoryController.getHistory);

// Update Item Route
router.put('/items/:id', authorize('admin', 'editor'), inventoryController.updateItem.bind(inventoryController));

// Delete Item Route
router.delete('/items/:id', authorize('admin', 'editor'), inventoryController.deleteItem.bind(inventoryController));

export default router;
