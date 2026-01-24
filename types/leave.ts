export interface LeaveType {
    id: number;
    name: string;
    description: string;
    is_deductible: boolean;
}

export interface LeaveRequest {
    id: number;
    user_id: number;
    leave_type_id: number;
    reason: string;
    start_at: string;
    end_at: string;
    duration_hours: number;
    duration_days?: number;
    employee_name?: string;
    jabatan?: string;
    alamat_karyawan?: string;
    replacement_name?: string;
    address_during_leave?: string;
    status: 'diajukan' | 'disetujui' | 'ditolak';
    admin_note?: string;
    approved_at?: string;
    approved_by?: number;
    created_at: string;
    leave_types?: LeaveType;
}

export interface LeaveBalance {
    id: number;
    user_id: number;
    year: number;
    total_quota_hours: number;
    used_hours: number;
    remaining_hours: number;
}
