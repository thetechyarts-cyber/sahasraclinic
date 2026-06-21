import { Request, Response, NextFunction } from 'express';
import { consultationService } from './consultation.service';
import { sendSuccess } from '../../utils/response';

export const createConsultation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consultation = await consultationService.createConsultation(req.body, req.user!.id);
    sendSuccess(res, consultation, 201, 'Consultation created successfully');
  } catch (err) {
    next(err);
  }
};

export const getConsultationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consultation = await consultationService.getConsultationById(req.params.id);
    sendSuccess(res, consultation);
  } catch (err) {
    next(err);
  }
};

export const updateConsultation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consultation = await consultationService.updateConsultation(req.params.id, req.body);
    sendSuccess(res, consultation, 200, 'Consultation updated');
  } catch (err) {
    next(err);
  }
};

export const getDoctorConsultations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only fetch for the currently logged-in doctor
    const consultations = await consultationService.getDoctorConsultations(req.user!.id);
    sendSuccess(res, consultations);
  } catch (err) {
    next(err);
  }
};
