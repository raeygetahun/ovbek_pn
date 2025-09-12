import { Request, Response, NextFunction } from 'express';
import firebase from '../services/firebaseService';

export interface AuthenticatedRequest extends Request {
    user?: {
        uid: string;
        email?: string;
        admin?: boolean;
    };
}

// Verify user is authenticated
export const authenticateUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ success: false, error: 'No authorization header' });
        return;
    }

    // Handle "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

    try {
        const decodedToken = await firebase.auth().verifyIdToken(token);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            admin: decodedToken.admin === true
        };
        next();
    } catch (error) {
        console.error('Error verifying ID token:', error);
        res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
};

// Verify user is an admin
export const requireAdmin = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ success: false, error: 'No authorization header' });
        return;
    }

    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

    try {
        const decodedToken = await firebase.auth().verifyIdToken(token);

        if (decodedToken.admin !== true) {
            res.status(403).json({ success: false, error: 'Admin access required' });
            return;
        }

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            admin: true
        };
        next();
    } catch (error) {
        console.error('Error verifying ID token:', error);
        res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
};
