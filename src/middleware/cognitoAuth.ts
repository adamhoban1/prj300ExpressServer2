// middleware/cognitoAuth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { cognitoConfig } from '../config/cognito';

// Configure JWKS client
const client = jwksClient({
  jwksUri: cognitoConfig.jwksUri
});

// Function to get the signing key
function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback): void {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

// Extend Express Request type to include user
export interface AuthRequest extends Request {
  user?: {
    sub: string; // Cognito user ID
    email?: string;
    email_verified?: boolean;
    'cognito:username'?: string;
    [key: string]: any;
  };
}

// Middleware to verify Cognito JWT token
export const verifyCognitoToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ error: 'No authorization header provided' });
    return;
  }

  const token = authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  jwt.verify(
    token,
    getKey,
    {
      algorithms: ['RS256'],
      issuer: cognitoConfig.issuer
    },
    (err, decoded) => {
      if (err) {
        res.status(401).json({ 
          error: 'Invalid token', 
          details: err.message 
        });
        return;
      }

      req.user = decoded as AuthRequest['user'];
      next();
    }
  );
};