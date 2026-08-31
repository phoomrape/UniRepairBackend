const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

const getAllUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: { repairRequests: true }
        }
      },
      orderBy: { id: 'desc' }
    });

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงรายการผู้ใช้' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        repairRequests: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { category: true, location: true }
        }
      }
    });

    if (!user) return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });
    if (existing) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        role: role || 'USER',
        status: status || 'ACTIVE'
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

    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, status, password } = req.body;

    const data = {};
    if (name) data.name = name.trim();
    if (email) data.email = email.trim().toLowerCase();
    if (phone !== undefined) data.phone = phone ? phone.trim() : null;
    if (role) data.role = role;
    if (status) data.status = status;
    if (password && password.trim() !== '') {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        updatedAt: true
      }
    });

    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'ไม่สามารถลบบัญชีของตนเองที่กำลังใช้งานอยู่ได้' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    return res.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบผู้ใช้' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
