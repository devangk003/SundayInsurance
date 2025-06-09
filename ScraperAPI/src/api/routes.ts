import { Router } from 'express';
import { getInsuranceQuotes } from '../controllers/scrapeController';
import { validateQuoteRequest } from '../middlewares/validation';

const router = Router();

router.post('/api/quotes', (req, res, next) => {
  const { carReg, phoneNumber, isPolicyExpired, hasMadeClaim, isNewCar } = req.body;
  
  // Phone number is always required
  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      error: "Phone number is required"
    });
  }
  
  // Only validate registration if not a new car
  if (!isNewCar && !carReg) {
    return res.status(400).json({
      success: false,
      error: "Registration number is required for existing cars"
    });
  }
  
  next();
});

router.post('/quotes', validateQuoteRequest, getInsuranceQuotes);

export default router;