import { Request, Response } from 'express';
import { Policy } from '../models/Policy';
import { Car } from '../models/Car';
import { Notification } from '../models/Notification';
import { asyncHandler, ApiResponse } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export const getPolicies = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.uid;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status as string;

  const filter: any = { userId };
  if (status) {
    filter.status = status;
  }

  const policies = await Policy.find(filter)
    .populate('carId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Policy.countDocuments(filter);

  res.json({
    success: true,
    data: policies,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  } as ApiResponse);
});

export const getPolicyById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.uid;
  const { id } = req.params;

  const policy = await Policy.findOne({ _id: id, userId }).populate('carId');

  if (!policy) {
    return res.status(404).json({
      success: false,
      message: 'Policy not found'
    } as ApiResponse);
  }

  res.json({
    success: true,
    data: policy
  } as ApiResponse);
});

export const createPolicy = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.uid;
  const policyData = { ...req.body, userId };

  // Verify the car belongs to the user
  const car = await Car.findOne({ _id: policyData.carId, userId, isActive: true });
  if (!car) {
    return res.status(400).json({
      success: false,
      message: 'Invalid car selection'
    } as ApiResponse);
  }

  const policy = await Policy.create(policyData);
  await policy.populate('carId');

  // Create notification for new policy
  await Notification.create({
    userId,
    title: 'New Policy Created',
    message: `Policy ${policy.policyNumber} has been created for your ${car.year} ${car.make} ${car.model}`,
    type: 'policy'
  });

  res.status(201).json({
    success: true,
    message: 'Policy created successfully',
    data: policy
  } as ApiResponse);
});

export const updatePolicy = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.uid;
  const { id } = req.params;
  const updateData = req.body;

  // Remove userId from update data to prevent tampering
  delete updateData.userId;

  const policy = await Policy.findOneAndUpdate(
    { _id: id, userId },
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('carId');

  if (!policy) {
    return res.status(404).json({
      success: false,
      message: 'Policy not found'
    } as ApiResponse);
  }

  res.json({
    success: true,
    message: 'Policy updated successfully',
    data: policy
  } as ApiResponse);
});

export const deletePolicy = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.uid;
  const { id } = req.params;

  const policy = await Policy.findOneAndUpdate(
    { _id: id, userId },
    { $set: { status: 'cancelled' } },
    { new: true }
  ).populate('carId');

  if (!policy) {
    return res.status(404).json({
      success: false,
      message: 'Policy not found'
    } as ApiResponse);
  }

  // Create notification for cancelled policy
  await Notification.create({
    userId,
    title: 'Policy Cancelled',
    message: `Policy ${policy.policyNumber} has been cancelled`,
    type: 'policy'
  });

  res.json({
    success: true,
    message: 'Policy cancelled successfully',
    data: policy
  } as ApiResponse);
});

export const getExpiringSoon = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.uid;
  const days = parseInt(req.query.days as string) || 30;

  const expiringPolicies = await Policy.find({
    userId,
    status: 'active',
    endDate: {
      $gte: new Date(),
      $lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    }
  }).populate('carId').sort({ endDate: 1 });

  res.json({
    success: true,
    data: expiringPolicies
  } as ApiResponse);
});

export const renewPolicy = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.uid;
  const { id } = req.params;
  const renewalData = req.body;

  const originalPolicy = await Policy.findOne({ _id: id, userId }).populate('carId');

  if (!originalPolicy) {
    return res.status(404).json({
      success: false,
      message: 'Policy not found'
    } as ApiResponse);
  }

  // Create new policy with updated data
  const newPolicyData = {
    ...originalPolicy.toObject(),
    ...renewalData,
    _id: undefined,
    policyNumber: renewalData.policyNumber || `${originalPolicy.policyNumber}-R${Date.now()}`,
    status: 'active',
    startDate: renewalData.startDate || new Date(),
    endDate: renewalData.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    createdAt: undefined,
    updatedAt: undefined
  };

  const newPolicy = await Policy.create(newPolicyData);
  await newPolicy.populate('carId');

  // Mark old policy as expired
  originalPolicy.status = 'expired';
  await originalPolicy.save();

  // Create notification for renewal
  await Notification.create({
    userId,
    title: 'Policy Renewed',
    message: `Policy ${newPolicy.policyNumber} has been renewed successfully`,
    type: 'renewal'
  });

  res.json({
    success: true,
    message: 'Policy renewed successfully',
    data: newPolicy
  } as ApiResponse);
});
