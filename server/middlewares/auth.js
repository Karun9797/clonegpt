import jwt from 'jsonwebtoken';
import User from '../models/users.js';

export const protect = async (request, response, next) => {
  let token = request.headers.authorization;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);

    if (!user) {
      return response.json({ success: false, message: 'Not authorized, user not found' });
    }

    request.user = user;
    next();
  } catch (error) {
    response.status(401).json({ message: 'Not authorized, token failed' });
  }
};
