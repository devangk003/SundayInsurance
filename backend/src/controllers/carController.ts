import { Request, Response } from 'express';
import { Car } from '../models/Car';
import { Policy } from '../models/Policy';
import { asyncHandler, ApiResponse } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export const getCars = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.uid;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const cars = await Car.find({ userId, isActive: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Car.countDocuments({ userId, isActive: true });

  res.json({
    success: true,
    data: cars,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  } as ApiResponse);
});

export const getCarById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.uid;
  const { id } = req.params;

  const car = await Car.findOne({ _id: id, userId, isActive: true });

  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    } as ApiResponse);
  }

  // Get associated policies
  const policies = await Policy.find({ carId: car._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      car,
      policies
    }
  } as ApiResponse);
});

export const createCar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.uid;
  const carData = { ...req.body, userId };

  const car = await Car.create(carData);

  res.status(201).json({
    success: true,
    message: 'Car added successfully',
    data: car
  } as ApiResponse);
});

export const updateCar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.uid;
  const { id } = req.params;
  const updateData = req.body;

  // Remove userId from update data to prevent tampering
  delete updateData.userId;

  const car = await Car.findOneAndUpdate(
    { _id: id, userId, isActive: true },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    } as ApiResponse);
  }

  res.json({
    success: true,
    message: 'Car updated successfully',
    data: car
  } as ApiResponse);
});

export const deleteCar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.uid;
  const { id } = req.params;

  // Soft delete - mark as inactive
  const car = await Car.findOneAndUpdate(
    { _id: id, userId, isActive: true },
    { $set: { isActive: false } },
    { new: true }
  );

  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    } as ApiResponse);
  }

  // Also mark associated policies as cancelled
  await Policy.updateMany(
    { carId: car._id, status: 'active' },
    { $set: { status: 'cancelled' } }
  );

  res.json({
    success: true,
    message: 'Car deleted successfully'
  } as ApiResponse);
});

export const uploadCarPhotos = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.uid;
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    } as ApiResponse);
  }

  const car = await Car.findOne({ _id: id, userId, isActive: true });

  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    } as ApiResponse);
  }

  // Add new photo paths to car
  const photoPaths = files.map(file => file.path);
  car.photos = [...(car.photos || []), ...photoPaths];
  await car.save();

  res.json({
    success: true,
    message: 'Photos uploaded successfully',
    data: {
      photos: photoPaths,
      totalPhotos: car.photos.length
    }
  } as ApiResponse);
});
