import { Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service';
import { sendSuccess } from '../../utils/response';

export const getAllSettings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await settingsService.getAllSettings();
    sendSuccess(res, settings);
  } catch (err) {
    next(err);
  }
};

export const getSettingByKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await settingsService.getSettingByKey(req.params.key);
    sendSuccess(res, setting);
  } catch (err) {
    next(err);
  }
};

export const updateSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await settingsService.updateSetting(req.params.key, req.body.value, req.user!.id);
    sendSuccess(res, setting, 200, 'Settings updated successfully');
  } catch (err) {
    next(err);
  }
};
