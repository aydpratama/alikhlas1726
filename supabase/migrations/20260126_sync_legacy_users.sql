-- 1. Pastikan tabel admin_roles sudah ada (sudah dibuat sebelumnya)
-- Kita akan menyesuaikan isi admin_roles agar sinkron dengan peran di tabel users lama

-- Update permissions untuk peran yang sudah ada
UPDATE admin_roles SET permissions = '["*"]' WHERE name = 'superadmin';
UPDATE admin_roles SET permissions = '["keuangan", "donatur"]' WHERE name = 'bendahara';
UPDATE admin_roles SET permissions = '["galeri", "ustadz", "program", "pengumuman", "info_struktur"]' WHERE name = 'konten';
UPDATE admin_roles SET permissions = '["kajian"]' WHERE name = 'ibadah';

-- Tambah peran baru jika belum ada
INSERT INTO admin_roles (name, description, permissions)
VALUES 
('imam', 'Manajemen data imam dan jadwal shalat', '["imam", "jadwal_shalat"]')
ON CONFLICT (name) DO NOTHING;

-- 2. Migrasi Data dari public.users ke public.admin_profiles
-- Kita hanya memigrasikan user yang sudah memiliki auth_id (sudah pernah login/terdaftar di Auth)

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

-- 3. Verifikasi Hasil
SELECT ap.full_name, r.name as role_name, u.email
FROM admin_profiles ap
JOIN admin_roles r ON ap.role_id = r.id
JOIN public.users u ON ap.id = u.auth_id;
