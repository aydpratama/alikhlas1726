import { supabase } from '../supabase';

export type Permission =
  | '*'
  | 'bendahara'
  | 'donatur'
  | 'galeri'
  | 'ustadz'
  | 'program'
  | 'pengumuman'
  | 'info_struktur'
  | 'kajian'
  | 'pemulasaraan_umum_edit'
  | 'iuran_pemulasaraan';

export interface AdminProfile {
  id: string;
  auth_id: string;
  email: string;
  nama_lengkap: string;
  peran: string;
}

/**
 * Mendapatkan profil admin dari tabel users (public) untuk user yang sedang login
 */
export async function getAdminProfile(): Promise<AdminProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Coba cari berdasarkan auth_id dulu, jika tidak ketemu cari berdasarkan email
  let { data, error } = await (supabase
    .from('users') as any)
    .select('id, auth_id, email, nama_lengkap, peran')
    .eq('auth_id', user.id)
    .maybeSingle();

  if (!data && !error && user.email) {
    // Jika tidak ketemu berdasarkan auth_id, coba cari berdasarkan email
    const result = await (supabase
      .from('users') as any)
      .select('id, auth_id, email, nama_lengkap, peran')
      .eq('email', user.email)
      .maybeSingle();

    data = result.data;
    error = result.error;

    // Jika ketemu berdasarkan email tapi auth_id masih kosong, kita bisa update (opsional)
    if (data && !data.auth_id) {
      console.log('Syncing auth_id for user:', user.email);
      await (supabase
        .from('users') as any)
        .update({ auth_id: user.id })
        .eq('id', data.id);
    }
  }

  if (error) {
    console.error('Error fetching admin profile:', {
      message: error.message || 'No message',
      code: error.code || 'No code',
      details: error.details || 'No details',
      hint: error.hint || 'No hint',
      full_error: JSON.stringify(error),
      context: 'getAdminProfile'
    });
    return null;
  }

  return data as AdminProfile;
}

/**
 * Mengecek apakah user memiliki permission tertentu berdasarkan peran
 */
export function hasPermission(profile: AdminProfile | null, permission: Permission): boolean {
  if (!profile) return false;

  const peran = profile.peran;

  // Mapping sederhana peran ke permission
  if (peran === 'super_admin') return true;

  // Imam dan Marbot hanya untuk login cuti, bukan admin web
  if (peran === 'imam' || peran === 'marbot') {
    return false;
  }

  switch (permission) {
    case 'bendahara':
      return peran === 'bendahara';
    case 'donatur':
      return peran === 'bendahara';
    case 'galeri':
    case 'ustadz':
    case 'program':
    case 'pengumuman':
      return peran === 'konten' || peran === 'editor';
    case 'kajian':
      return peran === 'kajian';
    case 'info_struktur':
      return peran === 'editor' || peran === 'konten';
    case 'pemulasaraan_umum_edit':
      return peran === 'bendahara';
    case 'iuran_pemulasaraan':
      return peran === 'bendahara' || peran === 'iuran';
    default:
      return false;
  }
}

/**
 * Helper untuk mencatat aktivitas (sementara dimatikan karena tabel dihapus)
 */
export async function logActivity(
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  module: string,
  details: any
) {
  console.log('Activity log (disabled):', { action, module, details });
}
