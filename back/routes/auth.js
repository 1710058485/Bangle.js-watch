import express from 'express';
import * as userService from '../services/userService.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, phone, nickname } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空',
        data: null
      });
    }

    const user = await userService.register({
      username,
      password,
      email,
      phone,
      nickname
    });

    res.json({
      code: 200,
      message: '注册成功',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: error.message,
      data: null
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空',
        data: null
      });
    }

    const userInfo = await userService.login(username, password);

    // 生成 JWT Token
    const token = generateToken({
      id: userInfo.id,
      username: userInfo.username,
      role: userInfo.role
    });

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        userInfo
      }
    });
  } catch (error) {
    res.status(401).json({
      code: 401,
      message: error.message,
      data: null
    });
  }
});

export default router;
