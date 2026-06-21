import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';
import { sendSuccess } from '../../utils/response';

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const result = await reportsService.getDashboardStats(
      startDate as string | undefined,
      endDate as string | undefined
    );
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};
export const getDoctorDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const doctorId = req.user!.id;
    const result = await reportsService.getDoctorDashboardStats(doctorId);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const getPharmacistDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const stats = await reportsService.getPharmacistDashboardStats(req.user!.id);
    sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
};
