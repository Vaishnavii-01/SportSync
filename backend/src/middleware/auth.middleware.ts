// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import User from '../models/user';
// import AppError from '../utils/appError';
// import config from '../config/config';

// interface UserPayload {
//   id: string;
//   role: string;
// }

// declare global {
//   namespace Express {
//     interface Request {
//       user?: UserPayload;
//     }
//   }
// }

// export const protect = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // 1) Getting token and check if it's there
//     let token;
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//       token = req.headers.authorization.split(' ')[1];
//     }
    
//     if (!token) {
//       return next(new AppError('You are not logged in! Please log in to get access.', 401));
//     }
    
//     // 2) Verification token
//     const decoded = jwt.verify(token, config.jwtSecret) as UserPayload;
    
//     // 3) Check if user still exists
//     const currentUser = await User.findById(decoded.id);
//     if (!currentUser) {
//       return next(new AppError('The user belonging to this token does no longer exist.', 401));
//     }
    
//     // GRANT ACCESS TO PROTECTED ROUTE
//     req.user = {
//       id: currentUser._id.toString(),
//       role: currentUser.role
//     };
    
//     next();
//   } catch (err) {
//     next(err);
//   }
// };

// export const restrictTo = (...roles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!roles.includes(req.user?.role as string)) {
//       return next(new AppError('You do not have permission to perform this action', 403));
//     }
    
//     next();
//   };
// };