import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';
import { sendSuccess } from '../../utils/response';

export const markPaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await paymentService.markPaymentPaid(req.params.id, req.body, req.user!.id);
    sendSuccess(res, result, 200, 'Payment marked successfully');
  } catch (err) {
    next(err);
  }
};

export const getPatientPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await paymentService.getPatientPayments(req.params.id);
    sendSuccess(res, payments, 200, 'Patient payments fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const getPendingPayments = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await paymentService.getPendingPayments();
    sendSuccess(res, payments, 200, 'Pending payments fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const uploadScreenshot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new Error('Screenshot file is required'));
    }
    const result = await paymentService.uploadScreenshot(req.params.id, req.file, req.body.upiRef, req.user!.id);
    sendSuccess(res, result, 200, 'Screenshot uploaded successfully');
  } catch (err) {
    next(err);
  }
};
