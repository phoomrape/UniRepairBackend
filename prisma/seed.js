const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Seeding Database...');

  // Hash passwords
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const hashedPasswordStaff = await bcrypt.hash('staff123', 10);
  const hashedPasswordOfficer = await bcrypt.hash('Officer@123', 10);
  const hashedPasswordAgency = await bcrypt.hash('Agency@123', 10);
  const hashedPasswordUser = await bcrypt.hash('user123', 10);

  // 1. Seed Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@university.ac.th' },
    update: { password: hashedPasswordAdmin },
    create: {
      name: 'ผู้ดูแลระบบ (Admin)',
      email: 'admin@university.ac.th',
      password: hashedPasswordAdmin,
      phone: '081-234-5678',
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  const officer1 = await prisma.user.upsert({
    where: { email: 'officer1@university.ac.th' },
    update: { password: hashedPasswordOfficer },
    create: {
      name: 'เจ้าหน้าที่รับเรื่อง (Officer 1)',
      email: 'officer1@university.ac.th',
      password: hashedPasswordOfficer,
      phone: '089-111-2222',
      role: 'STAFF',
      status: 'ACTIVE'
    }
  });

  const agency1 = await prisma.user.upsert({
    where: { email: 'agency1@university.ac.th' },
    update: { password: hashedPasswordAgency },
    create: {
      name: 'เจ้าหน้าที่หน่วยงาน (Agency Officer 1)',
      email: 'agency1@university.ac.th',
      password: hashedPasswordAgency,
      phone: '089-333-4444',
      role: 'STAFF',
      status: 'ACTIVE'
    }
  });

  const staff1 = await prisma.user.upsert({
    where: { email: 'staff@university.ac.th' },
    update: { password: hashedPasswordStaff },
    create: {
      name: 'นายสมชาย ช่างซ่อม',
      email: 'staff@university.ac.th',
      password: hashedPasswordStaff,
      phone: '089-999-8888',
      role: 'STAFF',
      status: 'ACTIVE'
    }
  });

  const staff2 = await prisma.user.upsert({
    where: { email: 'technician2@university.ac.th' },
    update: { password: hashedPasswordStaff },
    create: {
      name: 'นายวิชัย ช่างไฟฟ้า',
      email: 'technician2@university.ac.th',
      password: hashedPasswordStaff,
      phone: '086-777-6666',
      role: 'STAFF',
      status: 'ACTIVE'
    }
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@university.ac.th' },
    update: {},
    create: {
      name: 'นายรักเรียน ขยันยิ่ง',
      email: 'student@university.ac.th',
      password: hashedPasswordUser,
      phone: '082-111-2222',
      role: 'USER',
      status: 'ACTIVE'
    }
  });

  const lecturer = await prisma.user.upsert({
    where: { email: 'lecturer@university.ac.th' },
    update: {},
    create: {
      name: 'ดร.สมศักดิ์ อาจารย์ประจำ',
      email: 'lecturer@university.ac.th',
      password: hashedPasswordUser,
      phone: '083-333-4444',
      role: 'USER',
      status: 'ACTIVE'
    }
  });

  console.log('✅ Users seeded');

  // 2. Seed Categories
  const categoriesData = [
    { name: 'เครื่องปรับอากาศ', description: 'แอร์ไม่เย็น แอร์มีน้ำหยด เสียงดัง เปิดไม่ติด' },
    { name: 'ระบบไฟฟ้าและหลอดไฟ', description: 'หลอดไฟขาด สวิตช์เสีย ปลั๊กไฟชำรุด ไฟฟ้าดับ' },
    { name: 'โต๊ะ เก้าอี้ และครุภัณฑ์', description: 'ขาโต๊ะหัก เก้าอี้ชำรุด บานพับตู้เสีย' },
    { name: 'คอมพิวเตอร์และโพรเจกเตอร์', description: 'จอไม่ติด โพรเจกเตอร์สีเพี้ยน เครื่องค้าง' },
    { name: 'ระบบเครือข่ายและอินเทอร์เน็ต', description: 'Wi-Fi เข้าไม่ได้ สาย LAN ขาด สัญญาณหลุดบ่อย' },
    { name: 'ระบบประปาและสุขภัณฑ์', description: 'ท่อน้ำรั่ว ก๊อกน้ำเสีย ชักโครกอุดตัน' }
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const createdCat = await prisma.repairCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    });
    categories.push(createdCat);
  }
  console.log('✅ Categories seeded');

  // 3. Seed Locations
  const locationsData = [
    { buildingName: 'อาคารเรียนรวม 1 (CB1)', description: 'อาคารเรียนรวมฝั่งทิศตะวันออก' },
    { buildingName: 'อาคารวิศวกรรมศาสตร์ 3 (ENG3)', description: 'อาคารปฏิบัติการคณะวิศวกรรมศาสตร์' },
    { buildingName: 'อาคารสำนักคอมพิวเตอร์ (IT Center)', description: 'ศูนย์บริการเทคโนโลยีสารสนเทศ' },
    { buildingName: 'หอพักนักศึกษา ชาย 2', description: 'อาคารหอพักภายในมหาวิทยาลัย' },
    { buildingName: 'อาคารสำนักงานอธิการบดี', description: 'อาคารบริหารงานกลาง' }
  ];

  const locations = [];
  for (const loc of locationsData) {
    const createdLoc = await prisma.location.upsert({
      where: { buildingName: loc.buildingName },
      update: {},
      create: loc
    });
    locations.push(createdLoc);
  }
  console.log('✅ Locations seeded');

  // 4. Seed Mock Repair Requests
  const countRepairs = await prisma.repairRequest.count();
  if (countRepairs === 0) {
    const mockRepairs = [
      {
        userId: student.id,
        categoryId: categories[0].id, // แอร์
        locationId: locations[0].id,  // CB1
        room: 'CB102',
        description: 'แอร์ห้อง CB102 มีน้ำหยดลงมาใส่โต๊ะเรียน และไม่เย็นเลยครับ',
        status: 'IN_PROGRESS',
        assignedTo: staff1.id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: lecturer.id,
        categoryId: categories[3].id, // คอม/โพรเจกเตอร์
        locationId: locations[1].id,  // ENG3
        room: 'ENG304',
        description: 'โพรเจกเตอร์หน้าห้องสีเพี้ยนออกโทนสีเขียว และไฟเตือน Lamp เปลี่ยนสี',
        status: 'WAITING_PARTS',
        assignedTo: staff1.id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: student.id,
        categoryId: categories[1].id, // ไฟฟ้า
        locationId: locations[3].id,  // หอพัก
        room: 'ห้อง 405',
        description: 'หลอดไฟกลางห้องกระพริบถี่ๆ และติดๆ ดับๆ ตลอดคืน',
        status: 'COMPLETED',
        assignedTo: staff2.id,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        userId: student.id,
        categoryId: categories[4].id, // อินเทอร์เน็ต
        locationId: locations[2].id,  // IT Center
        room: 'Lab 3',
        description: 'พอร์ต LAN เลขที่ 15 หน้าห้องแล็บ 3 สัญญาณไม่เข้าคอมพิวเตอร์',
        status: 'PENDING',
        assignedTo: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: lecturer.id,
        categoryId: categories[2].id, // โต๊ะเก้าอี้
        locationId: locations[0].id,  // CB1
        room: 'CB401',
        description: 'เก้าอี้อาจารย์ขาหลุด 1 ตัว ต้องการให้เปลี่ยนหรือซ่อมแซม',
        status: 'CANCELLED',
        assignedTo: null,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      }
    ];

    for (const req of mockRepairs) {
      const createdReq = await prisma.repairRequest.create({
        data: req
      });

      // Add log
      await prisma.repairLog.create({
        data: {
          repairRequestId: createdReq.id,
          userId: req.userId,
          oldStatus: null,
          newStatus: 'PENDING',
          note: 'ส่งคำขอแจ้งซ่อมเข้าระบบ',
          createdAt: req.createdAt
        }
      });

      if (req.status !== 'PENDING') {
        await prisma.repairLog.create({
          data: {
            repairRequestId: createdReq.id,
            userId: req.assignedTo || admin.id,
            oldStatus: 'PENDING',
            newStatus: req.status,
            note: req.status === 'COMPLETED' ? 'ซ่อมแซมเรียบร้อยแล้ว' : req.status === 'WAITING_PARTS' ? 'สั่งซื้ออะไหล่หลอดภาพใหม่' : 'รับเรื่องและกำลังเข้าดำเนินการ',
            createdAt: new Date(req.createdAt.getTime() + 1000 * 60 * 60 * 4)
          }
        });
      }
    }
    console.log('✅ Mock repair requests & logs seeded');
  }

  console.log('🎉 Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
