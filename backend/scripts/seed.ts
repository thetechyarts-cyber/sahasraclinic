import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const SALT_ROUNDS = 12;

/**
 * Seed script — creates default roles, permissions, and super admin user.
 * Run: npm run db:seed
 */
async function seed(): Promise<void> {
  console.log('🌱 Starting HMS database seed...\n');

  // ─── 1. Create Roles ──────────────────────────────────────────

  console.log('📋 Creating roles...');
  const roles = [
    { name: 'super_admin', description: 'Full system access — create orgs, manage roles, subscriptions' },
    { name: 'admin', description: 'Clinic operations — register patients, billing, queue, documents' },
    { name: 'doctor', description: 'Clinical — assigned patients, consultation, prescription, prognosis' },
    { name: 'pharmacist', description: 'Dispensary — today\'s approved prescriptions only' },
    { name: 'patient', description: 'Patient — case sheet, upload reports, payments, request prescriptions' },
  ];

  const { data: createdRoles, error: rolesError } = await supabase
    .from('roles')
    .upsert(roles, { onConflict: 'name' })
    .select();

  if (rolesError) {
    console.error('❌ Failed to create roles:', rolesError);
    process.exit(1);
  }
  console.log(`  ✅ ${createdRoles.length} roles created\n`);

  // ─── 2. Create Permissions ────────────────────────────────────

  console.log('🔐 Creating permissions...');
  const permissions = [
    // Auth
    { name: 'manage_users', module: 'auth' },
    { name: 'manage_roles', module: 'auth' },
    // Patients
    { name: 'create_patient', module: 'patients' },
    { name: 'view_patients', module: 'patients' },
    { name: 'update_patient', module: 'patients' },
    { name: 'reactivate_patient', module: 'patients' },
    // Case Sheets
    { name: 'create_case_sheet', module: 'case_sheets' },
    { name: 'view_case_sheet', module: 'case_sheets' },
    { name: 'update_case_sheet', module: 'case_sheets' },
    // Consultations
    { name: 'create_consultation', module: 'consultations' },
    { name: 'view_consultation', module: 'consultations' },
    { name: 'update_consultation', module: 'consultations' },
    // Prescriptions
    { name: 'create_prescription', module: 'prescriptions' },
    { name: 'view_prescriptions', module: 'prescriptions' },
    { name: 'approve_prescription', module: 'prescriptions' },
    { name: 'request_prescription_copy', module: 'prescriptions' },
    { name: 'approve_prescription_request', module: 'prescriptions' },
    // Pharmacist
    { name: 'view_today_prescriptions', module: 'pharmacist' },
    { name: 'dispense_medicine', module: 'pharmacist' },
    // Queue
    { name: 'manage_queue', module: 'queue' },
    { name: 'view_queue', module: 'queue' },
    // Payments
    { name: 'create_payment', module: 'payments' },
    { name: 'mark_payment_paid', module: 'payments' },
    { name: 'view_payments', module: 'payments' },
    // Prognosis
    { name: 'create_prognosis', module: 'prognosis' },
    { name: 'view_prognosis', module: 'prognosis' },
    // Documents
    { name: 'upload_documents', module: 'documents' },
    { name: 'view_documents', module: 'documents' },
    // CMS
    { name: 'manage_cms', module: 'cms' },
    // Billing
    { name: 'manage_billing', module: 'billing' },
    { name: 'view_billing', module: 'billing' },
    // Audit
    { name: 'view_audit_logs', module: 'audit' },
    // Reports
    { name: 'view_reports', module: 'reports' },
    // System
    { name: 'system_settings', module: 'system' },
    { name: 'manage_subscriptions', module: 'system' },
  ];

  const { data: createdPerms, error: permsError } = await supabase
    .from('permissions')
    .upsert(permissions, { onConflict: 'name' })
    .select();

  if (permsError) {
    console.error('❌ Failed to create permissions:', permsError);
    process.exit(1);
  }
  console.log(`  ✅ ${createdPerms.length} permissions created\n`);

  // ─── 3. Map Permissions to Roles ──────────────────────────────

  console.log('🔗 Mapping permissions to roles...');

  const roleMap = new Map(createdRoles.map((r: { name: string; id: string }) => [r.name, r.id]));
  const permMap = new Map(createdPerms.map((p: { name: string; id: string }) => [p.name, p.id]));

  // Role-permission mappings per SECURITY-RBAC.md
  const rolePermissions: Record<string, string[]> = {
    super_admin: [
      'manage_users', 'manage_roles', 'create_patient', 'view_patients', 'update_patient',
      'reactivate_patient', 'create_case_sheet', 'view_case_sheet', 'update_case_sheet',
      'view_consultation', 'view_prescriptions', 'approve_prescription',
      'manage_queue', 'view_queue', 'mark_payment_paid', 'view_payments',
      'view_prognosis', 'upload_documents', 'view_documents', 'manage_cms',
      'manage_billing', 'view_billing', 'view_audit_logs', 'view_reports',
      'system_settings', 'manage_subscriptions',
    ],
    admin: [
      'manage_users', 'create_patient', 'view_patients', 'update_patient',
      'reactivate_patient', 'create_case_sheet', 'view_case_sheet', 'update_case_sheet',
      'view_consultation', 'view_prescriptions', 'approve_prescription',
      'manage_queue', 'view_queue', 'mark_payment_paid', 'view_payments',
      'view_prognosis', 'upload_documents', 'view_documents', 'manage_cms',
      'manage_billing', 'view_billing', 'view_audit_logs', 'view_reports',
    ],
    doctor: [
      'view_patients', 'reactivate_patient', 'view_case_sheet',
      'create_consultation', 'view_consultation', 'update_consultation',
      'create_prescription', 'view_prescriptions', 'approve_prescription',
      'approve_prescription_request', 'view_queue',
      'create_prognosis', 'view_prognosis', 'view_documents',
    ],
    pharmacist: [
      'view_today_prescriptions', 'dispense_medicine',
    ],
    patient: [
      'create_case_sheet', 'view_case_sheet',
      'request_prescription_copy', 'view_prescriptions',
      'create_payment', 'view_billing',
      'upload_documents', 'view_documents',
    ],
  };

  const mappings: { role_id: string; permission_id: string }[] = [];
  for (const [roleName, permNames] of Object.entries(rolePermissions)) {
    const roleId = roleMap.get(roleName);
    if (!roleId) continue;

    for (const permName of permNames) {
      const permId = permMap.get(permName);
      if (!permId) continue;
      mappings.push({ role_id: roleId, permission_id: permId });
    }
  }

  const { error: mappingError } = await supabase
    .from('role_permissions')
    .upsert(mappings, { onConflict: 'role_id,permission_id' });

  if (mappingError) {
    console.error('❌ Failed to map role permissions:', mappingError);
    process.exit(1);
  }
  console.log(`  ✅ ${mappings.length} role-permission mappings created\n`);

  // ─── 4. Create Super Admin User ───────────────────────────────

  console.log('👤 Creating super admin user...');

  const superAdminRoleId = roleMap.get('super_admin');
  const passwordHash = await bcrypt.hash('Admin@123', SALT_ROUNDS);

  const { data: adminUser, error: adminError } = await supabase
    .from('users')
    .upsert(
      {
        email: 'admin@hospital.com',
        password_hash: passwordHash,
        name: 'System Administrator',
        role_id: superAdminRoleId,
        status: 'active',
      },
      { onConflict: 'email' },
    )
    .select('id, email, name')
    .single();

  if (adminError) {
    console.error('❌ Failed to create super admin:', adminError);
    process.exit(1);
  }

  console.log(`  ✅ Super Admin created:`);
  console.log(`     Email: admin@hospital.com`);
  console.log(`     Password: Admin@123`);
  console.log(`     ⚠️  Change this password immediately after first login!\n`);

  // ─── Done ─────────────────────────────────────────────────────

  console.log('══════════════════════════════════════════');
  console.log('✅ HMS database seed completed successfully!');
  console.log('══════════════════════════════════════════\n');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
