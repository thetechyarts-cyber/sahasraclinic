import { Request, Response, NextFunction } from 'express';
import { queueService } from './queue.service';
import { sendSuccess } from '../../utils/response';

export const generateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = await queueService.generateToken(req.body, req.user!.id);
    sendSuccess(res, token, 201, 'Queue token generated successfully');
  } catch (err) {
    next(err);
  }
};

export const getLiveQueue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.query.doctor_id as string | undefined;
    const queue = await queueService.getLiveQueue(doctorId);
    sendSuccess(res, queue);
  } catch (err) {
    next(err);
  }
};

export const getPatientQueue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokens = await queueService.getPatientQueue(req.params.patientId);
    sendSuccess(res, tokens);
  } catch (err) {
    next(err);
  }
};

export const updateTokenStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = await queueService.updateStatus(req.params.id, req.body, req.user!.id);
    sendSuccess(res, token, 200, 'Queue token status updated');
  } catch (err) {
    next(err);
  }
};
