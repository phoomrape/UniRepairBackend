const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'กรุณากรอกชื่อ-นามสกุล, อีเมล และรหัสผ่านให้ครบถ้วน' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานในระบบแล้ว' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        role: 'USER',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    const token = generateToken({ id: user.id, role: user.role });

    return res.status(201).json({
      message: 'ลงทะเบียนสำเร็จ',
      token,
      user
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียน', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'กรุณากรอก อีเมล และ รหัสผ่าน' });
    }

    const inputTerm = email.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: inputTerm },
          { email: `${inputTerm}@university.ac.th` }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'บัญชีผู้ใช้นี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const token = generateToken({ id: user.id, role: user.role });

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    };

    return res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', error: error.message });
  }
};

const me = async (req, res) => {
  try {
    return res.json({ user: req.user });
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
  }
};

module.exports = {
  register,
  login,
  me
};
