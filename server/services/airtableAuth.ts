import axios from 'axios';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

const AIRTABLE_CLIENT_ID = process.env.AIRTABLE_CLIENT_ID;
const AIRTABLE_CLIENT_SECRET = process.env.AIRTABLE_CLIENT_SECRET;
const AIRTABLE_REDIRECT_URI = process.env.AIRTABLE_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface AirtableTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
  scope: string;
}

export interface AirtableUserInfo {
  id: string;
  email: string;
  name: string;
  profilePicUrl?: string;
}

export class AirtableAuthService {
  static getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: AIRTABLE_CLIENT_ID!,
      redirect_uri: AIRTABLE_REDIRECT_URI!,
      response_type: 'code',
      scope: 'data.records:read data.records:write data.recordComments:read data.recordComments:write schema.bases:read schema.bases:write webhook:manage',
      state: state || ''
    });

    return `https://airtable.com/oauth2/v1/authorize?${params.toString()}`;
  }

  static async exchangeCodeForToken(code: string): Promise<AirtableTokenResponse> {
    try {
      const response = await axios.post('https://airtable.com/oauth2/v1/token', {
        grant_type: 'authorization_code',
        code,
        redirect_uri: AIRTABLE_REDIRECT_URI,
        client_id: AIRTABLE_CLIENT_ID,
        client_secret: AIRTABLE_CLIENT_SECRET
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error('Failed to exchange authorization code for access token');
    }
  }

  static async getUserInfo(accessToken: string): Promise<AirtableUserInfo> {
    try {
      const response = await axios.get('https://api.airtable.com/v0/meta/whoami', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name || response.data.email,
        profilePicUrl: response.data.profilePicUrl
      };
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw new Error('Failed to fetch user information from Airtable');
    }
  }

  static async createOrUpdateUser(userInfo: AirtableUserInfo, tokenData: AirtableTokenResponse): Promise<IUser> {
    try {
      const expiresAt = tokenData.expires_in 
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : undefined;

      const user = await User.findOneAndUpdate(
        { airtableId: userInfo.id },
        {
          airtableId: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          airtableAccessToken: tokenData.access_token,
          airtableRefreshToken: tokenData.refresh_token,
          tokenExpiresAt: expiresAt,
          profileImage: userInfo.profilePicUrl
        },
        { 
          upsert: true, 
          new: true,
          runValidators: true
        }
      );

      return user;
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw new Error('Failed to create or update user');
    }
  }

  static generateJWT(userId: string): string {
    return jwt.sign(
      { userId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  static verifyJWT(token: string): { userId: string } {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static async refreshAccessToken(refreshToken: string): Promise<AirtableTokenResponse> {
    try {
      const response = await axios.post('https://airtable.com/oauth2/v1/token', {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: AIRTABLE_CLIENT_ID,
        client_secret: AIRTABLE_CLIENT_SECRET
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh access token');
    }
  }
}
