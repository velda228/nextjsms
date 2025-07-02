import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Ошибка валидации: проверьте правильность заполнения полей',
      details: errors.array().map(err => {
        const out: any = { message: err.msg };
        if ('param' in err) out.field = (err as any).param;
        if ('value' in err) out.value = (err as any).value;
        return out;
      })
    });
  }
  
  next();
}; 