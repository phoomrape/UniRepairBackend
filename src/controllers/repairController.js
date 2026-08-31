const prisma = require('../config/prisma');

const createRepair = async (req, res) => {
  try {
    const { categoryId, locationId, room, description } = req.body;
    const userId = req.user.id;

    if (!categoryId || !locationId || !room || !description) {
      return res.status(400).json({ message: 'กรุณากรอกประเภทปัญหา, สถานะ/อาคาร, ห้อง และรายละเอียดปัญหาให้ครบถ้วน' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const repair = await prisma.repairRequest.create({
      data: {
        userId,
        categoryId: parseInt(categoryId),
        locationId: parseInt(locationId),
        room: room.trim(),
        description: description.trim(),
        image: imageUrl,
        status: 'PENDING'
      },
      include: {
        category: true,
        location: true,
        user: { select: { id: true, name: true, email: true, phone: true } }
      }
    });

    // Record Log
    await prisma.repairLog.create({
      data: {
        repairRequestId: repair.id,
        userId,
        oldStatus: null,
        newStatus: 'PENDING',
        note: 'แจ้งซ่อมใหม่ผ่านระบบ'
      }
    });

    return res.status(201).json(repair);
  } catch (error) {
    console.error('Create Repair Error:', error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างคำขอแจ้งซ่อม', error: error.message });
  }
};

const getAllRepairs = async (req, res) => {
  try {
    const { search, status, categoryId, locationId, page = 1, limit = 50, myHistory } = req.query;
    const currentUser = req.user;

    const where = {};

    // Filter by ownership if USER role or explicitly requested myHistory
    if (currentUser.role === 'USER' || myHistory === 'true') {
      where.userId = currentUser.id;
    }

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (locationId) {
      where.locationId = parseInt(locationId);
    }

    if (search) {
      where.OR = [
        { description: { contains: search } },
        { room: { contains: search } },
        { user: { name: { contains: search } } },
        { location: { buildingName: { contains: search } } },
        { category: { name: { contains: search } } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [total, repairs] = await Promise.all([
      prisma.repairRequest.count({ where }),
      prisma.repairRequest.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          location: true,
          user: { select: { id: true, name: true, email: true, phone: true } },
          technician: { select: { id: true, name: true, email: true, phone: true } }
        }
      })
    ]);

    return res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: repairs
    });
  } catch (error) {
    console.error('Get Repairs Error:', error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงรายการแจ้งซ่อม' });
  }
};

const getRepairById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const repair = await prisma.repairRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        location: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        technician: { select: { id: true, name: true, email: true, phone: true } },
        logs: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, role: true } }
          }
        }
      }
    });

    if (!repair) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลการแจ้งซ่อม' });
    }

    // Permission check for regular users
    if (currentUser.role === 'USER' && repair.userId !== currentUser.id) {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์เข้าถึงรายการแจ้งซ่อมนี้' });
    }

    return res.json(repair);
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงรายละเอียดการแจ้งซ่อม' });
  }
};

const updateRepairStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, note } = req.body;
    const currentUserId = req.user.id;

    const existingRepair = await prisma.repairRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRepair) {
      return res.status(404).json({ message: 'ไม่พบรายการแจ้งซ่อม' });
    }

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    }

    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo ? parseInt(assignedTo) : null;
    }

    const updatedRepair = await prisma.repairRequest.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: true,
        location: true,
        user: { select: { id: true, name: true, email: true } },
        technician: { select: { id: true, name: true, email: true } }
      }
    });

    // Create log if status changed or note provided
    if (status !== existingRepair.status || note || assignedTo !== existingRepair.assignedTo) {
      let logNote = note || '';
      if (assignedTo && assignedTo !== existingRepair.assignedTo) {
        const tech = await prisma.user.findUnique({ where: { id: parseInt(assignedTo) } });
        logNote += (logNote ? ' | ' : '') + `มอบหมายงานให้: ${tech ? tech.name : 'ช่างซ่อม'}`;
      }

      await prisma.repairLog.create({
        data: {
          repairRequestId: parseInt(id),
          userId: currentUserId,
          oldStatus: existingRepair.status,
          newStatus: status || existingRepair.status,
          note: logNote || 'อัปเดตข้อมูลการแจ้งซ่อม'
        }
      });
    }

    return res.json(updatedRepair);
  } catch (error) {
    console.error('Update Status Error:', error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะการซ่อม' });
  }
};

const cancelRepair = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const currentUser = req.user;

    const repair = await prisma.repairRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!repair) {
      return res.status(404).json({ message: 'ไม่พบรายการแจ้งซ่อม' });
    }

    if (currentUser.role === 'USER' && repair.userId !== currentUser.id) {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ยกเลิกคำขอนี้' });
    }

    if (repair.status !== 'PENDING' && currentUser.role === 'USER') {
      return res.status(400).json({ message: 'ไม่สามารถยกเลิกคำขอที่รับเรื่องไปแล้วได้' });
    }

    const updated = await prisma.repairRequest.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' }
    });

    await prisma.repairLog.create({
      data: {
        repairRequestId: parseInt(id),
        userId: currentUser.id,
        oldStatus: repair.status,
        newStatus: 'CANCELLED',
        note: note || 'ยกเลิกคำขอแจ้งซ่อมโดยผู้ใช้'
      }
    });

    return res.json({ message: 'ยกเลิกรายการแจ้งซ่อมเรียบร้อยแล้ว', data: updated });
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการยกเลิกคำขอแจ้งซ่อม' });
  }
};

const deleteRepair = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.repairRequest.delete({
      where: { id: parseInt(id) }
    });

    return res.json({ message: 'ลบรายการแจ้งซ่อมสำเร็จ' });
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบรายการแจ้งซ่อม' });
  }
};

module.exports = {
  createRepair,
  getAllRepairs,
  getRepairById,
  updateRepairStatus,
  cancelRepair,
  deleteRepair
};
