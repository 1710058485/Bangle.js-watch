import db from '../config/database.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// 用户注册
export const register = async (userData) => {
  const { username, password, email, phone, nickname } = userData;

  // 检查用户名是否已存在
  const [existingUsers] = await db.query(
    'SELECT id FROM user WHERE username = ?',
    [username]
  );

  if (existingUsers.length > 0) {
    throw new Error('用户名已存在');
  }

  // 检查邮箱是否已存在
  if (email) {
    const [existingEmails] = await db.query(
      'SELECT id FROM user WHERE email = ?',
      [email]
    );

    if (existingEmails.length > 0) {
      throw new Error('邮箱已被使用');
    }
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // 插入新用户
  const [result] = await db.query(
    'INSERT INTO user (username, password, email, phone, nickname, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [username, hashedPassword, email, phone, nickname, 'USER', 1]
  );

  return {
    id: result.insertId,
    username,
    email,
    phone,
    nickname,
    role: 'USER'
  };
};

// 用户登录
export const login = async (username, password) => {
  // 查询用户
  const [users] = await db.query(
    'SELECT id, username, password, email, phone, nickname, role, status FROM user WHERE username = ?',
    [username]
  );

  if (users.length === 0) {
    throw new Error('用户名或密码错误');
  }

  const user = users[0];

  // 检查用户状态
  if (user.status !== 1) {
    throw new Error('账号已被禁用');
  }

  // 验证密码
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('用户名或密码错误');
  }

  // 返回用户信息（不包含密码）
  const { password: _, ...userInfo } = user;
  return userInfo;
};

// 根据ID获取用户信息
export const getUserById = async (userId) => {
  const [users] = await db.query(
    'SELECT id, username, email, phone, nickname, avatar, role, status, create_time, update_time FROM user WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    throw new Error('用户不存在');
  }

  return users[0];
};
