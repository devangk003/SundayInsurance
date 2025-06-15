import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  uploadCarPhotos
} from '../controllers/carController';

const router = express.Router();

// All car routes require authentication
router.use(authenticateToken);

router.get('/', getCars);
router.get('/:id', getCarById);
router.post('/', createCar);
router.put('/:id', updateCar);
router.delete('/:id', deleteCar);
router.post('/:id/photos', uploadCarPhotos);

export default router;
