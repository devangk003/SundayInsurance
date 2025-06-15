import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
  getExpiringSoon,
  renewPolicy
} from '../controllers/policyController';

const router = express.Router();

// All policy routes require authentication
router.use(authenticateToken);

router.get('/', getPolicies);
router.get('/expiring', getExpiringSoon);
router.get('/:id', getPolicyById);
router.post('/', createPolicy);
router.put('/:id', updatePolicy);
router.delete('/:id', deletePolicy);
router.post('/:id/renew', renewPolicy);

export default router;
