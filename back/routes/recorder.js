import express from 'express';
import pool from '../config/database.js';
import { authenticateToken as authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 所有路由需要认证
router.use(authMiddleware);

// 上传轨迹
router.post('/upload', async (req, res) => {
  const { filename, rawCsv } = req.body;
  const userId = req.user.id;

  if (!filename || !rawCsv) {
    return res.status(400).json({ code: 400, message: '缺少必要参数', data: null });
  }

  try {
    // 解析 CSV 获取基本信息
    const lines = rawCsv.trim().split('\n').filter(l => l.trim());
    const dataLines = lines.filter(l => !l.startsWith('#') && !l.startsWith('time'));
    const pointCount = dataLines.length;

    // 尝试从文件名或数据中提取时间
    let startTime = null;
    let endTime = null;
    if (dataLines.length > 0) {
      const firstTs = parseFloat(dataLines[0].split(',')[0]);
      const lastTs = parseFloat(dataLines[dataLines.length - 1].split(',')[0]);
      if (!isNaN(firstTs)) startTime = new Date(firstTs * 1000);
      if (!isNaN(lastTs)) endTime = new Date(lastTs * 1000);
    }

    const [result] = await pool.execute(
      'INSERT INTO recorder_track (user_id, filename, start_time, end_time, point_count, raw_csv) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, filename, startTime, endTime, pointCount, rawCsv]
    );

    res.json({ code: 200, message: '上传成功', data: { id: result.insertId } });
  } catch (err) {
    console.error('上传轨迹失败:', err);
    res.status(500).json({ code: 500, message: '上传失败', data: null });
  }
});

// 获取轨迹列表
router.get('/tracks', async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await pool.execute(
      'SELECT id, filename, start_time, end_time, point_count, create_time FROM recorder_track WHERE user_id = ? ORDER BY create_time DESC',
      [userId]
    );
    res.json({ code: 200, message: 'ok', data: rows });
  } catch (err) {
    console.error('获取轨迹列表失败:', err);
    res.status(500).json({ code: 500, message: '获取失败', data: null });
  }
});

// 删除轨迹
router.delete('/tracks/:id', async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const [result] = await pool.execute(
      'DELETE FROM recorder_track WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '轨迹不存在', data: null });
    }
    res.json({ code: 200, message: '删除成功', data: null });
  } catch (err) {
    console.error('删除轨迹失败:', err);
    res.status(500).json({ code: 500, message: '删除失败', data: null });
  }
});

export default router;
