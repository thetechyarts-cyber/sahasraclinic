import { Request, Response, NextFunction } from 'express';
import { caseSheetService } from './case-sheet.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/app-error';

export const createCaseSheet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseSheet = await caseSheetService.create(req.body, req.user!.id);
    sendSuccess(res, caseSheet, 201, 'Case sheet created successfully');
  } catch (err) {
    next(err);
  }
};

export const getCaseSheet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseSheet = await caseSheetService.getById(req.params.id);
    sendSuccess(res, caseSheet);
  } catch (err) {
    next(err);
  }
};

export const updateCaseSheet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseSheet = await caseSheetService.update(req.params.id, req.body, req.user!.id);
    sendSuccess(res, caseSheet, 200, 'Case sheet updated successfully');
  } catch (err) {
    next(err);
  }
};

export const uploadDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }
    
    const { patient_id } = req.body;
    if (!patient_id) {
      throw new AppError('patient_id is required', 400);
    }

    const uploadPromises = (req.files as Express.Multer.File[]).map(file => 
      caseSheetService.uploadDocument(req.params.id, patient_id, file, req.user!.id)
    );

    const documents = await Promise.all(uploadPromises);

    sendSuccess(res, documents, 201, 'Documents uploaded successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await caseSheetService.deleteDocument(req.params.docId, req.user!.id);
    sendSuccess(res, null, 200, 'Document deleted successfully');
  } catch (err) {
    next(err);
  }
};
