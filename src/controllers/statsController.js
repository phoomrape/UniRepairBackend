const prisma = require('../config/prisma');

const getDashboardStats = async (req, res) => {
  try {
    // 1. Total & Status Counts
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const [total, pending, inProgress, accepted, waitingParts, completed, cancelled, overdue] = await Promise.all([
      prisma.repairRequest.count(),
      prisma.repairRequest.count({ where: { status: 'PENDING' } }),
      prisma.repairRequest.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.repairRequest.count({ where: { status: 'ACCEPTED' } }),
      prisma.repairRequest.count({ where: { status: 'WAITING_PARTS' } }),
      prisma.repairRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.repairRequest.count({ where: { status: 'CANCELLED' } }),
      prisma.repairRequest.count({
        where: {
          status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'WAITING_PARTS'] },
          createdAt: { lt: threeDaysAgo }
        }
      })
    ]);

    // 2. Count repairs by category
    const categoriesWithCount = await prisma.repairCategory.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { repairRequests: true }
        }
      }
    });

    const categoryStats = categoriesWithCount.map(c => ({
      id: c.id,
      name: c.name,
      count: c._count.repairRequests
    })).sort((a, b) => b.count - a.count);

    // 3. Count repairs by location / building
    const locationsWithCount = await prisma.location.findMany({
      select: {
        id: true,
        buildingName: true,
        _count: {
          select: { repairRequests: true }
        }
      }
    });

    const locationStats = locationsWithCount.map(l => ({
      id: l.id,
      buildingName: l.buildingName,
      count: l._count.repairRequests
    })).sort((a, b) => b.count - a.count);

    // 4. Recent monthly stats (Last 6 months)
    const allRepairsForMonthly = await prisma.repairRequest.findMany({
      select: { createdAt: true, status: true }
    });

    const monthMap = {};
    // Pre-fill last 6 months
    const now = new Date();
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
      monthMap[key] = { month: key, count: 0, completed: 0 };
    }

    allRepairsForMonthly.forEach(r => {
      const date = new Date(r.createdAt);
      const key = `${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
      if (monthMap[key]) {
        monthMap[key].count += 1;
        if (r.status === 'COMPLETED') {
          monthMap[key].completed += 1;
        }
      }
    });

    const monthlyStats = Object.values(monthMap);

    return res.json({
      summary: {
        total,
        pending,
        accepted,
        inProgress,
        waitingParts,
        completed,
        cancelled,
        overdue,
        inWorkTotal: pending + accepted + inProgress + waitingParts
      },
      topCategory: categoryStats.length > 0 ? categoryStats[0] : null,
      topLocation: locationStats.length > 0 ? locationStats[0] : null,
      categoryStats,
      locationStats,
      monthlyStats
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard' });
  }
};

module.exports = {
  getDashboardStats
};
