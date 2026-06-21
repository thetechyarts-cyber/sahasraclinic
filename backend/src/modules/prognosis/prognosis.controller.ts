import { Request, Response, NextFunction } from 'express';
import { prognosisService } from './prognosis.service';
import { sendSuccess } from '../../utils/response';

export const createPrognosis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prognosis = await prognosisService.createPrognosis(req.body, req.user!.id);
    sendSuccess(res, prognosis, 201, 'Prognosis log created successfully');
  } catch (err) {
    next(err);
  }
};

export const getPatientPrognosisHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await prognosisService.getPatientPrognosisHistory(req.params.patientId);
    sendSuccess(res, logs);
  } catch (err) {
    next(err);
  }
};

export const updatePrognosis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prognosis = await prognosisService.updatePrognosis(req.params.id, req.body, req.user!.id);
    sendSuccess(res, prognosis, 200, 'Prognosis updated successfully');
  } catch (err) {
    next(err);
  }
};

export const getFollowUps = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isDoctor = req.user?.role === 'doctor';
    const doctorId = isDoctor ? req.user!.id : undefined;
    const followups = await prognosisService.getScheduledFollowUps(doctorId);
    sendSuccess(res, followups);
  } catch (err) {
    next(err);
  }
};
