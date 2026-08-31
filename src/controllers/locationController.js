const prisma = require('../config/prisma');

const getAllLocations = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const where = includeInactive === 'true' ? {} : { isActive: true };

    const locations = await prisma.location.findMany({
      where,
      orderBy: { id: 'asc' }
    });
    return res.json(locations);
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอาคาร/สถานที่' });
  }
};

const createLocation = async (req, res) => {
  try {
    const { buildingName, description } = req.body;
    if (!buildingName) {
      return res.status(400).json({ message: 'กรุณาระบุชื่ออาคาร/สถานที่' });
    }

    const location = await prisma.location.create({
      data: { buildingName: buildingName.trim(), description: description ? description.trim() : null }
    });
    return res.status(201).json(location);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'ชื่ออาคาร/สถานที่นี้มีอยู่ในระบบแล้ว' });
    }
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างสถานที่' });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { buildingName, description, isActive } = req.body;

    const location = await prisma.location.update({
      where: { id: parseInt(id) },
      data: {
        ...(buildingName !== undefined && { buildingName: buildingName.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(isActive !== undefined && { isActive })
      }
    });
    return res.json(location);
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขอาคาร/สถานที่' });
  }
};

const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.location.delete({
      where: { id: parseInt(id) }
    });
    return res.json({ message: 'ลบอาคาร/สถานที่สำเร็จ' });
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบอาคาร/สถานที่' });
  }
};

module.exports = {
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation
};
