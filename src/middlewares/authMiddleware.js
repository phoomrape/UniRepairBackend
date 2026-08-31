const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/prisma');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน (Missing Token)' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, phone: true, role: true, status: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'ผู้ใช้งานไม่ถูกต้องหรือถูกลบไปแล้ว' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'บัญชีผู้ใช้นี้ถูกระงับการใช้งาน' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลหรือดำเนินการในส่วนนี้' });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
