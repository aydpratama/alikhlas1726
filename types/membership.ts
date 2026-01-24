export interface Member {
    id: number;
    no_anggota: string;
    nama_lengkap: string;
    hubungan_keluarga: string;
    jenis_anggota: string;
    alamat: string;
    rt: number;
    rw: number;
    status: string;
    pendaftaran: number;
    tanggal_keanggotaan: string;
    biaya_anggota?: number;
    no_telepon?: string;
    email?: string;
}

export type Keluarga = {
    no_anggota: string; // Family ID prefix
    alamat: string;
    rt: number;
    rw: number;
    members: Member[];
}

export type Anggota = Member;

export interface KartuBulanan {
    id?: number;
    kartu_id?: number; // Alias for compatibility
    id_anggota: number;
    no_anggota: string;
    tahun: number;
    bulan_januari?: number;
    bulan_februari?: number;
    bulan_maret?: number;
    bulan_april?: number;
    bulan_mei?: number;
    bulan_juni?: number;
    bulan_juli?: number;
    bulan_agustus?: number;
    bulan_september?: number;
    bulan_oktober?: number;
    bulan_november?: number;
    bulan_desember?: number;
    tanggal_bayar_januari?: string;
    tanggal_bayar_februari?: string;
    tanggal_bayar_maret?: string;
    tanggal_bayar_april?: string;
    tanggal_bayar_mei?: string;
    tanggal_bayar_juni?: string;
    tanggal_bayar_juli?: string;
    tanggal_bayar_agustus?: string;
    tanggal_bayar_september?: string;
    tanggal_bayar_oktober?: string;
    tanggal_bayar_november?: string;
    tanggal_bayar_desember?: string;
}
