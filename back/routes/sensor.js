import express from 'express';
import pool from '../config/database.js';
import { authenticateToken as authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 记录字段：心率、加速度(XYZ)、气压计(温度/气压/海拔)

router.use(authMiddleware);

// 保存一条传感器快照
router.post('/record', async (req, res) => {
  const userId = req.user.id;
  const { bpm, accel_x, accel_y, accel_z, pressure, pressure_temp, pressure_alt } = req.body;

  try {
    const [result] = await pool.execute(
      `INSERT INTO sensor_record
        (user_id, bpm, accel_x, accel_y, accel_z, pressure, pressure_temp, pressure_alt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        bpm ?? null,
        accel_x ?? null, accel_y ?? null, accel_z ?? null,
        pressure ?? null, pressure_temp ?? null, pressure_alt ?? null,
      ]
    );
    res.json({ code: 200, message: '保存成功', data: { id: result.insertId } });
  } catch (err) {
    console.error('保存传感器数据失败:', err);
    res.status(500).json({ code: 500, message: '保存失败', data: null });
  }
});

// 获取传感器数据列表（分页）
router.get('/records', async (req, res) => {
  const userId = req.user.id;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const pageSize = Math.min(100, parseInt(req.query.pageSize) || 20);
  const offset = (page - 1) * pageSize;

  try {
    const [[{ total }]] = await pool.execute(
      'SELECT COUNT(*) as total FROM sensor_record WHERE user_id = ?',
      [userId]
    );
    const [rows] = await pool.query(
      'SELECT * FROM sensor_record WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, pageSize, offset]
    );
    res.json({ code: 200, message: 'ok', data: { total, list: rows, page, pageSize } });
  } catch (err) {
    console.error('获取传感器数据失败:', err);
    res.status(500).json({ code: 500, message: '获取失败', data: null });
  }
});

// 清空当前用户的传感器数据
router.delete('/records', async (req, res) => {
  const userId = req.user.id;
  try {
    await pool.execute('DELETE FROM sensor_record WHERE user_id = ?', [userId]);
    res.json({ code: 200, message: '清空成功', data: null });
  } catch (err) {
    console.error('清空传感器数据失败:', err);
    res.status(500).json({ code: 500, message: '清空失败', data: null });
  }
});

export default router;
