import { Request, Response } from 'express';
import { AirtableAuthService } from '../services/airtableAuth';
import { User } from '../models/User';

export async function initiateAirtableAuth(req: Request, res: Response) {
  try {
    const state = req.query.state as string;
    const authUrl = AirtableAuthService.getAuthUrl(state);
    
    res.json({ 
      authUrl,
      message: 'Redirect user to this URL for Airtable authentication'
    });
  } catch (error) {
    console.error('Error initiating auth:', error);
    res.status(500).json({ error: 'Failed to initiate authentication' });
  }
}

export async function handleAirtableCallback(req: Request, res: Response) {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code not provided' });
    }

    // Exchange code for access token
    const tokenData = await AirtableAuthService.exchangeCodeForToken(code as string);
    
    // Get user information from Airtable
    const userInfo = await AirtableAuthService.getUserInfo(tokenData.access_token);
    
    // Create or update user in database
    const user = await AirtableAuthService.createOrUpdateUser(userInfo, tokenData);
    
    // Generate JWT for our application
    const jwtToken = AirtableAuthService.generateJWT(user._id.toString());
    
    // Redirect to frontend with token
    const redirectUrl = state 
      ? `${process.env.FRONTEND_URL || 'http://localhost:8080'}/auth/callback?token=${jwtToken}&state=${state}`
      : `${process.env.FRONTEND_URL || 'http://localhost:8080'}/auth/callback?token=${jwtToken}`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error handling callback:', error);
    const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/auth/error?message=Authentication failed`;
    res.redirect(errorUrl);
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = AirtableAuthService.verifyJWT(token);
    
    const user = await User.findById(decoded.userId).select('-airtableAccessToken -airtableRefreshToken');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      airtableId: user.airtableId,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function logoutUser(req: Request, res: Response) {
  try {
    // For JWT-based auth, logout is handled client-side by removing the token
    // We could optionally blacklist the token here if needed
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
}
