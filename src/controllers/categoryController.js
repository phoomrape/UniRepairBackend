const prisma = require('../config/prisma');

const getAllCategories = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const where = includeInactive === 'true' ? {} : { isActive: true };

    const categories = await prisma.repairCategory.findMany({
      where,
      orderBy: { id: 'asc' }
    });
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทปัญหา' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'กรุณาระบุชื่อประเภทปัญหา' });
    }

    const category = await prisma.repairCategory.create({
      data: { name: name.trim(), description: description ? description.trim() : null }
    });
    return res.status(201).json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'ชื่อประเภทปัญหานี้มีอยู่ในระบบแล้ว' });
    }
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างประเภทปัญหา' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await prisma.repairCategory.update({
      where: { id: parseInt(id) },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(isActive !== undefined && { isActive })
      }
    });
    return res.json(category);
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขประเภทปัญหา' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.repairCategory.delete({
      where: { id: parseInt(id) }
    });
    return res.json({ message: 'ลบประเภทปัญหาสำเร็จ' });
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบประเภทปัญหา' });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
