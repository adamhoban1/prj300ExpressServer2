import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { cognitoConfig } from '../config/cognito';

const client = jwksClient({// This is the URL where Cognito exposes the public keys for verifying JWTs
  jwksUri: cognitoConfig.jwksUri
});

// This function retrieves the appropriate signing key based on the 'kid' in the JWT header
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

// This interface extends the Express Request to include a 'user' property that will hold the decoded Cognito token information after verification
export interface AuthRequest extends Request {
  user?: {
    sub: string; // Cognito user ID
    email?: string; // User's email from Cognito token
    email_verified?: boolean;// Whether the email is verified in Cognito
    'cognito:username'?: string;// The username as stored in Cognito
    'cognito:groups'?: string[]; // The groups the user belongs to in Cognito right now its for admin
    [key: string]: any;
  };
}

// This middleware function verifies the Cognito JWT token sent in the Authorization header of incoming requests.
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

  const token = authHeader.split(' ')[1]; 

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  jwt.verify(// This verifies the token using the getKey function to retrieve the signing key and checks the issuer and algorithm
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

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const userGroups = req.user?.['cognito:groups'] || [];
  if (!userGroups.includes('admins')) {
    res.status(403).json({ error: 'Admin privileges required' });
    return;
  }
  next();
};