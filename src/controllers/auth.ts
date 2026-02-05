import { Request, Response } from 'express';
import { collections } from '../database';
import { User } from '../models/user'
import * as argon2 from 'argon2';
import { sign as jwtSign } from 'jsonwebtoken';

export const handleLogin = async (req: Request, res: Response) => {

  const { email, password } = req.body;

  const dummyHash = await argon2.hash("time wasting");

  if (!email || !password) {
    res
      .status(400)
      .json({ message: 'Email and password are required' });
    return;
  }
  const user = await collections.users?.findOne({
    email: email.toLowerCase(),
  }) as unknown as User

  if (user && user.hashedPassword) {
    const isPasswordValid = await argon2.verify(user.hashedPassword, password);
    // If password is valid send a token

    if (isPasswordValid) {
      res.status(201).json({ accessToken: createAccessToken(user) });
    }
    else {
      res.status(401).json({
        message: 'Invalid email or password!'
      });
    }
    return;
  }


  await argon2.verify(dummyHash, password, );
  res.status(401).json({
    message: 'Invalid email or password!'
  });

}

  



const createAccessToken = (user: User | null): string => {
  const secret = process.env.JWTSECRET || "not very secret";
  const expiresTimeSeconds = 200; // 3.33 minutes
  console.log(expiresTimeSeconds);
  const payload: Object =
  {
    email: user?.email,
    name: user?.username
  }
  const token = jwtSign(payload, secret, { expiresIn: expiresTimeSeconds });
  return token;
}
