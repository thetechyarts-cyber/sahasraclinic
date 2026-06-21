import { Request, Response, NextFunction } from 'express';
import { patientService } from './patient.service';
import { sendSuccess, sendError } from '../../utils/response';
import { CreatePatientPayload, UpdatePatientPayload, SearchPatientsQuery } from './patient.schema';

/**
 * POST /patients — Register new patient (admin creates).
 */
export const createPatient = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = req.body as CreatePatientPayload;
    const result = await patientService.create(body, req.user!.id);
    sendSuccess(res, result, 201, 'Patient registered successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /patients — Search patients with filters.
 */
export const searchPatients = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = req.query as unknown as SearchPatientsQuery;
    const result = await patientService.search(query);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /patients/:id — Get full patient profile.
 */
export const getPatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patient = await patientService.getById(req.params.id);
    sendSuccess(res, patient);
  } catch (err) {
    next(err);
  }
};

export const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patient = await patientService.getByUserId(req.user!.id);
    sendSuccess(res, patient);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /patients/:id — Update patient.
 */
export const updatePatient = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = req.body as UpdatePatientPayload;
    const result = await patientService.update(req.params.id, body, req.user!.id);
    sendSuccess(res, result, 200, 'Patient updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /patients/:id/reactivate — Reactivate archived patient.
 */
export const reactivatePatient = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await patientService.reactivate(req.params.id, req.user!.id);
    sendSuccess(res, result, 200, 'Patient reactivated successfully');
  } catch (err) {
    next(err);
  }
};
