import User from '../models/users.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

//generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

//register users
export const registerUser = async (request, response) => {
  const { name, email, password } = request.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return response.json({ success: false, message: 'User already registered with this email' });
    }
    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);
    response.json({ success: true, token });
  } catch (error) {
    return response.json({ success: false, message: error.message });
  }
};

//api to login user
export const loginUser = async (request, response) => {
  const { email, password } = request.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const isMatched = await bcrypt.compare(password, user.password);

      if (isMatched) {
        const token = generateToken(user._id);
        return response.json({ success: true, token });
      }
    }
    return response.json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    return response.json({ success: false, message: error.message });
  }
};

//api to get user data
export const getUser = async (request, response) => {
  try {
    const user = request.user;
    return response.json({ success: true, user });
  } catch (error) {
    return response.json({ success: false, message: error.message });
  }
};
