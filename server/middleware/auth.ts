import { Request, Response, NextFunction } from 'express';
import { AirtableAuthService } from '../services/airtableAuth';
import { User } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    airtableId: string;
    email: string;
    name: string;
    airtableAccessToken: string;
  };
}

export async function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid authorization token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = AirtableAuthService.verifyJWT(token);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if token needs refresh
    if (user.tokenExpiresAt && user.tokenExpiresAt < new Date()) {
      if (!user.airtableRefreshToken) {
        return res.status(401).json({ error: 'Token expired and no refresh token available' });
      }

      try {
        const newTokenData = await AirtableAuthService.refreshAccessToken(user.airtableRefreshToken);
        
        const expiresAt = newTokenData.expires_in 
          ? new Date(Date.now() + newTokenData.expires_in * 1000)
          : undefined;

        user.airtableAccessToken = newTokenData.access_token;
        user.airtableRefreshToken = newTokenData.refresh_token || user.airtableRefreshToken;
        user.tokenExpiresAt = expiresAt;
        
        await user.save();
      } catch (error) {
        return res.status(401).json({ error: 'Failed to refresh access token' });
      }
    }

    req.user = {
      id: user._id.toString(),
      airtableId: user.airtableId,
      email: user.email,
      name: user.name,
      airtableAccessToken: user.airtableAccessToken
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
