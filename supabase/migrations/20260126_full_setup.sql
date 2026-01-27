-- GABUNGAN MIGRASI: SETUP ADMIN RBAC & SYNC USER LAMA
-- Jalankan script ini di SQL Editor Supabase

-- BAGIAN 1: STRUKTUR TABEL & KEAMANAN (RLS)

-- 1. Tabel Definisi Peran
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert Data Peran Default
INSERT INTO admin_roles (name, description, permissions) VALUES
('superadmin', 'Akses penuh ke seluruh sistem', '["*"]'),
('bendahara', 'Manajemen keuangan dan donatur', '["keuangan", "donatur"]'),
('konten', 'Manajemen konten, galeri, dan info organisasi', '["galeri", "ustadz", "program", "pengumuman", "info_struktur"]'),
('ibadah', 'Manajemen jadwal kajian', '["kajian"]'),
('pemulasaraan', 'Edit iuran bulanan anggota umum', '["pemulasaraan_umum_edit"]'),
('imam', 'Manajemen data imam dan jadwal shalat', '["imam", "jadwal_shalat"]'),
('pengurus_info', 'Hanya bisa edit struktur organisasi', '["info_struktur"]')
ON CONFLICT (name) DO UPDATE SET permissions = EXCLUDED.permissions;

-- 3. Tabel Profil Admin (Terhubung ke Auth Users Supabase)
CREATE TABLE IF NOT EXISTS admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES admin_roles(id),
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Log Aktivitas (Audit Log)
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- CREATE, UPDATE, DELETE
    module TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Aktifkan RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy Dasar:
-- Admin bisa melihat semua role
CREATE POLICY "Allow public read on roles" ON admin_roles FOR SELECT TO authenticated USING (true);

-- Admin bisa melihat profilnya sendiri
CREATE POLICY "Admin can view own profile" ON admin_profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- Superadmin bisa melihat semua profil
CREATE POLICY "Superadmin can view all profiles" ON admin_profiles FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM admin_profiles ap
        JOIN admin_roles ar ON ap.role_id = ar.id
        WHERE ap.id = auth.uid() AND ar.name = 'superadmin'
    )
);

-- Logging: Admin hanya bisa melihat log miliknya sendiri (kecuali superadmin)
CREATE POLICY "Admin can view own logs" ON admin_activity_logs FOR SELECT TO authenticated USING (auth.uid() = admin_id);
CREATE POLICY "Superadmin can view all logs" ON admin_activity_logs FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM admin_profiles ap
        JOIN admin_roles ar ON ap.role_id = ar.id
        WHERE ap.id = auth.uid() AND ar.name = 'superadmin'
    )
);

-- Hanya sistem/superadmin yang bisa insert ke log
CREATE POLICY "Allow insert logs for authenticated" ON admin_activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = admin_id);


-- BAGIAN 2: MIGRASI DATA LAMA (SYNC)

-- Migrasi Data dari public.users ke public.admin_profiles
-- Kita hanya memigrasikan user yang sudah memiliki auth_id
INSERT INTO admin_profiles (id, role_id, full_name)
SELECT 
    u.auth_id, 
    r.id as role_id,
    u.nama_lengkap
FROM public.users u
JOIN admin_roles r ON (
    CASE 
        WHEN u.peran = 'super_admin' THEN 'superadmin'
        WHEN u.peran = 'keuangan' THEN 'bendahara'
        WHEN u.peran = 'konten' THEN 'konten'
        WHEN u.peran = 'kajian' THEN 'ibadah'
        WHEN u.peran = 'imam' THEN 'imam'
        ELSE 'konten' -- default
    END = r.name
)
WHERE u.auth_id IS NOT NULL
ON CONFLICT (id) DO UPDATE SET 
    role_id = EXCLUDED.role_id,
    full_name = EXCLUDED.full_name;

-- Verifikasi Hasil
SELECT 'MIGRATION SUCCESS' as status, count(*) as synced_users FROM admin_profiles;
