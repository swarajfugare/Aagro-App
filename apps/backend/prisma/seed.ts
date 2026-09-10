import { PrismaClient, RoleName } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Agriculture Supply Chain Management System...');

  // 1. Seed Roles
  console.log('... Seeding default system roles');
  const rolesData: { name: RoleName; description: string }[] = [
    { name: RoleName.SUPER_ADMIN, description: 'Super Administrator with full system privileges' },
    { name: RoleName.ADMIN, description: 'Operations Administrator managing users, logistics, and verification' },
    { name: RoleName.STAFF, description: 'Support staff with read and triage privileges' },
    { name: RoleName.FARMER, description: 'Agricultural producer declaring supply and managing crops' },
    { name: RoleName.DRIVER, description: 'Logistics partner executing farm pickups and buyer deliveries' },
    { name: RoleName.BUYER, description: 'Commercial/institutional buyer creating demand requirements and orders' },
  ];

  const roleMap = new Map<RoleName, string>();
  for (const role of rolesData) {
    const record = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: { name: role.name, description: role.description },
    });
    roleMap.set(role.name, record.id);
  }

  // 2. Seed Baseline Permissions
  console.log('... Seeding core module permissions');
  const permissionsData = [
    // Users & RBAC
    { name: 'users:read', module: 'users', description: 'View user profiles' },
    { name: 'users:write', module: 'users', description: 'Create and update user accounts' },
    { name: 'users:verify', module: 'users', description: 'Verify KYC and user documents' },
    // Crops & Production
    { name: 'crops:read', module: 'crops', description: 'View crop catalog and varieties' },
    { name: 'crops:write', module: 'crops', description: 'Manage crop catalog and varieties' },
    // Supply & Demand
    { name: 'supply:create', module: 'supply', description: 'Declare farmer supply batches' },
    { name: 'supply:read', module: 'supply', description: 'View available supply batches' },
    { name: 'demand:create', module: 'demand', description: 'Create buyer commodity requirements' },
    { name: 'demand:read', module: 'demand', description: 'View buyer requirements' },
    // Matching & Orders
    { name: 'matching:execute', module: 'matching', description: 'Run supply-demand matching engine' },
    { name: 'orders:create', module: 'orders', description: 'Create and confirm supply chain orders' },
    { name: 'orders:read', module: 'orders', description: 'View orders and status lifecycle' },
    { name: 'orders:update_status', module: 'orders', description: 'Transition order state machine' },
    // Logistics & Trips
    { name: 'trips:dispatch', module: 'logistics', description: 'Assign and dispatch driver trips' },
    { name: 'trips:execute', module: 'logistics', description: 'Execute pickups and deliveries' },
    { name: 'locations:record', module: 'locations', description: 'Record GPS location updates' },
    // Financials & Reporting
    { name: 'payments:read', module: 'payments', description: 'View payment transactions and invoices' },
    { name: 'reports:view', module: 'reports', description: 'Access administrative analytics and reports' },
    // System Settings & Auditing
    { name: 'settings:manage', module: 'settings', description: 'Manage platform system configuration' },
    { name: 'audit:view', module: 'audit', description: 'Inspect audit trail logs' },
  ];

  const adminPermissions: string[] = [];
  for (const perm of permissionsData) {
    const record = await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description, module: perm.module },
      create: { name: perm.name, description: perm.description, module: perm.module },
    });
    adminPermissions.push(record.id);
  }

  // 3. Associate Admin Permissions
  const adminRoleId = roleMap.get(RoleName.ADMIN);
  const superAdminRoleId = roleMap.get(RoleName.SUPER_ADMIN);

  if (superAdminRoleId) {
    for (const permId of adminPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRoleId,
            permissionId: permId,
          },
        },
        update: {},
        create: {
          roleId: superAdminRoleId,
          permissionId: permId,
        },
      });
    }
  }

  if (adminRoleId) {
    for (const permId of adminPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRoleId,
            permissionId: permId,
          },
        },
        update: {},
        create: {
          roleId: adminRoleId,
          permissionId: permId,
        },
      });
    }
  }

  // 4. Seed Baseline System Settings
  console.log('... Seeding default system configuration settings');
  const systemSettings = [
    {
      key: 'PLATFORM_NAME',
      value: 'Agriculture Supply Chain Management Platform',
      description: 'Public name of the platform',
      isPublic: true,
    },
    {
      key: 'DEFAULT_CURRENCY',
      value: 'INR',
      description: 'Default platform currency code',
      isPublic: true,
    },
    {
      key: 'DEFAULT_QUANTITY_UNIT',
      value: 'KG',
      description: 'Default quantity measurement unit',
      isPublic: true,
    },
    {
      key: 'GPS_UPDATE_INTERVAL_SECONDS',
      value: '15',
      description: 'Target frequency in seconds for active driver GPS location ping',
      isPublic: true,
    },
    {
      key: 'MAX_VEHICLE_OVERLOAD_PERCENTAGE',
      value: '5',
      description: 'Maximum permitted vehicle overload tolerance before requiring override',
      isPublic: false,
    },
  ];

  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        description: setting.description,
        isPublic: setting.isPublic,
      },
      create: setting,
    });
  }

  // 5. Seed System Health baseline
  await prisma.systemHealth.upsert({
    where: { key: 'SYSTEM_STATUS' },
    update: { value: 'DATABASE_INITIALIZED' },
    create: {
      key: 'SYSTEM_STATUS',
      value: 'DATABASE_INITIALIZED',
    },
  });

  console.log('✅ Database baseline seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error executing database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
