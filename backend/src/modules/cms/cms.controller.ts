import { Request, Response, NextFunction } from 'express';
import { cmsService } from './cms.service';
import { sendSuccess } from '../../utils/response';

export const createContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await cmsService.create(req.body, req.user!.id);
    sendSuccess(res, result, 201, 'Content created successfully');
  } catch (err) {
    next(err);
  }
};

export const getAllContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, status } = req.query;
    const result = await cmsService.getAll(type as string, status as string);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const getContentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await cmsService.getById(req.params.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const updateContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await cmsService.update(req.params.id, req.body, req.user!.id);
    sendSuccess(res, result, 200, 'Content updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await cmsService.remove(req.params.id, req.user!.id);
    sendSuccess(res, result, 200, 'Content deleted successfully');
  } catch (err) {
    next(err);
  }
};
