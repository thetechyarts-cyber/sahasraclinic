import { Request, Response, NextFunction } from 'express';
import { prescriptionService } from './prescription.service';
import { sendSuccess } from '../../utils/response';

export const createPrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prescription = await prescriptionService.createPrescription(req.body, req.user!.id);
    sendSuccess(res, prescription, 201, 'Prescription created successfully');
  } catch (err) {
    next(err);
  }
};

export const getPrescriptionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prescription = await prescriptionService.getPrescriptionById(req.params.id);
    sendSuccess(res, prescription);
  } catch (err) {
    next(err);
  }
};

export const approvePrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prescription = await prescriptionService.approvePrescription(req.params.id, req.user!.id);
    sendSuccess(res, prescription, 200, 'Prescription approved');
  } catch (err) {
    next(err);
  }
};

export const getDoctorPrescriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prescriptions = await prescriptionService.getDoctorPrescriptions(req.user!.id);
    sendSuccess(res, prescriptions);
  } catch (err) {
    next(err);
  }
};

export const getAdminPrescriptions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const prescriptions = await prescriptionService.getAdminPrescriptions();
    sendSuccess(res, prescriptions);
  } catch (err) {
    next(err);
  }
};

export const getPatientPrescriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prescriptions = await prescriptionService.getPatientPrescriptions(req.user!.id);
    sendSuccess(res, prescriptions);
  } catch (err) {
    next(err);
  }
};

export const getPharmacistTodayPrescriptions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const prescriptions = await prescriptionService.getPharmacistTodayPrescriptions();
    sendSuccess(res, prescriptions);
  } catch (err) {
    next(err);
  }
};

export const getPharmacistHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prescriptions = await prescriptionService.getPharmacistHistory(req.user!.id);
    sendSuccess(res, prescriptions);
  } catch (err) {
    next(err);
  }
};

export const dispensePrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prescription = await prescriptionService.dispensePrescription(req.params.id, req.user!.id);
    sendSuccess(res, prescription, 200, 'Prescription marked as dispensed');
  } catch (err) {
    next(err);
  }
};

export const requestPrescriptionCopy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await prescriptionService.requestPrescriptionCopy(req.body, req.user!.id);
    sendSuccess(res, request, 201, 'Request submitted successfully');
  } catch (err) {
    next(err);
  }
};

export const approvePrescriptionRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await prescriptionService.approvePrescriptionRequest(req.params.id, req.user!.id);
    sendSuccess(res, request, 200, 'Request approved');
  } catch (err) {
    next(err);
  }
};

export const getDoctorPrescriptionRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await prescriptionService.getDoctorPrescriptionRequests(req.user!.id);
    sendSuccess(res, requests);
  } catch (err) {
    next(err);
  }
};
