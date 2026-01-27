"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarRange,
    GraduationCap,
    Plus,
    Pencil,
    Trash2,
    X,
    Save,
    Loader2,
    Upload,
    Image as ImageIcon
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/hooks/useAdmin";

interface FeaturedItem {
    id: number;
    title: string;
    imageSrc: string;
}

interface SectionCarouselProps {
    title: string;
    highlight: string;
    icon: React.ElementType;
    table: string;
    mapData: (item: Record<string, unknown>) => FeaturedItem;
    canEdit?: boolean;
}

const SectionCarousel: React.FC<SectionCarouselProps> = ({ title, highlight, icon: Icon, table, mapData, canEdit = false }) => {
    const [items, setItems] = useState<FeaturedItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState({ id: 0, title: '', imageSrc: '' });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Memoize mapData to prevent unnecessary re-renders
    const stableMapData = useCallback(mapData, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data } = await (supabase
            .from(table) as any)
            .select('*')
            .eq('aktif', true)
            .order('id', { ascending: true });

        if (data) {
            setItems(data.map(stableMapData));
        }
        setLoading(false);
    }, [table, stableMapData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Auto-scroll every 5 seconds
    useEffect(() => {
        if (items.length <= 1 || isPaused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [items.length, isPaused]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${table}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('featured')
                .upload(filePath, file);

            if (uploadError) {
                alert(`Upload Gagal: ${uploadError.message}`);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('featured')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, imageSrc: publicUrl }));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            alert(`Sistem Error: ${message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.imageSrc) {
            alert('Silakan upload gambar terlebih dahulu');
            return;
        }
        setSaving(true);

        const payload: Record<string, unknown> = {
            [table === 'featured_ustadz' ? 'nama' : 'judul']: formData.title,
            url_gambar: formData.imageSrc,
            aktif: true
        };

        if (table === 'program_unggulan') {
            payload.highlight = formData.title;
        }

        try {
            const res = editMode === 'create'
                ? await (supabase.from(table) as any).insert([payload])
                : await (supabase.from(table) as any).update(payload).eq('id', formData.id);
  
            if (res.error) {
                alert(`Error: ${res.error.message}`);
            } else {
                await fetchData();
                setIsEditorOpen(false);
                setFormData({ id: 0, title: '', imageSrc: '' });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            alert(`Sistem Error: ${message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus item ini?')) return;
        const { error } = await (supabase.from(table) as any).delete().eq('id', id);
        if (error) {
            alert(`Gagal menghapus: ${error.message}`);
        } else {
            await fetchData();
            if (currentIndex >= items.length - 1) setCurrentIndex(0);
        }
    };

    const openCreate = () => {
        setEditMode('create');
        setFormData({ id: 0, title: '', imageSrc: '' });
        setIsEditorOpen(true);
    };

    const openEdit = () => {
        const current = items[currentIndex];
        if (!current) return;
        setEditMode('edit');
        setFormData({ id: current.id, title: current.title, imageSrc: current.imageSrc });
        setIsEditorOpen(true);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-48 bg-slate-100 rounded-lg mx-auto animate-pulse" />
                <div className="aspect-video bg-slate-100 rounded-xl animate-pulse" />
            </div>
        );
    }

    const current = items[currentIndex];

    return (
        <div className="space-y-4">
            {/* Header with Title */}
            <div className="text-center">
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {title} <span className="text-emerald-600">{highlight}</span>
                </h3>
            </div>

            {/* CRUD Actions */}
            {canEdit && (
                <div className="flex items-center justify-center">
                    <div className="flex gap-1">
                        <button
                            onClick={openCreate}
                            title="Tambah Baru"
                            className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white active:scale-95 transition-all duration-200"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        {items.length > 0 && current && (
                            <>
                                <button
                                    onClick={openEdit}
                                    title="Edit Item"
                                    className="w-8 h-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-900 hover:text-white active:scale-95 transition-all duration-200"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(current.id)}
                                    title="Hapus Item"
                                    className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white active:scale-95 transition-all duration-200"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Carousel Display - CSS Opacity Transition (Super Smooth) */}
            <div
                className="relative bg-gradient-to-br from-slate-100 to-slate-50 rounded-md border border-slate-200 overflow-hidden aspect-video shadow-sm"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* All slides rendered at once - CSS opacity transition */}
                {items.length > 0 ? (
                    items.map((item, index) => (
                        <div
                            key={item.id}
                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"
                                }`}
                        >
                            {/* Using img tag for better performance like reference */}
                            <img
                                src={item.imageSrc}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                        <Icon className="w-10 h-10 mb-3 opacity-30" />
                        <p className="text-sm font-medium">Belum ada konten</p>
                    </div>
                )}
            </div>

            {/* Dots indicator */}
            {items.length > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                    {items.map((_, i) => (
                        <button
                            key={`dot-${i}`}
                            onClick={() => setCurrentIndex(i)}
                            aria-label={`Slide ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-300 ease-out ${i === currentIndex
                                ? 'bg-emerald-600 w-6'
                                : 'bg-slate-300 w-1.5 hover:bg-slate-400'
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* Editor Modal */}
            <AnimatePresence>
                {isEditorOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={(e) => e.target === e.currentTarget && setIsEditorOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                            className="bg-white w-full max-w-md rounded-md shadow-2xl p-6 border border-slate-200"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-lg font-bold text-slate-900">
                                    {editMode === 'create' ? 'Tambah' : 'Edit'} {title}
                                </h4>
                                <button
                                    onClick={() => setIsEditorOpen(false)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Judul / Nama
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                        placeholder="Ketik judul..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        Gambar Carousel
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                    />

                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`relative aspect-video rounded-md border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${formData.imageSrc
                                            ? 'border-emerald-400 bg-emerald-50/50'
                                            : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'
                                            }`}
                                    >
                                        {formData.imageSrc ? (
                                            <>
                                                <Image
                                                    src={formData.imageSrc}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                                    <div className="bg-white/90 rounded-full p-3">
                                                        <Upload className="w-5 h-5 text-slate-700" />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center space-y-2 p-6">
                                                {uploading ? (
                                                    <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
                                                ) : (
                                                    <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                                                )}
                                                <p className="text-sm text-slate-500 font-medium">
                                                    {uploading ? 'Mengunggah...' : 'Klik untuk upload gambar'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400">Format: JPG, PNG, WEBP. Maks 5MB.</p>
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditorOpen(false)}
                                        className="flex-1 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-full border border-slate-200 active:scale-[0.98] transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        disabled={saving || uploading}
                                        type="submit"
                                        className="flex-1 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-full hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export function FeaturedSections() {
    const { canManageContent } = useAdmin();

    return (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-3 sm:px-6">
            <SectionCarousel
                title="Kajian"
                highlight="Rutin"
                icon={CalendarRange}
                table="featured_ustadz"
                canEdit={canManageContent}
                mapData={(item) => ({
                    id: item.id as number,
                    title: item.nama as string,
                    imageSrc: item.url_gambar as string
                })}
            />
            <SectionCarousel
                title="Program"
                highlight="Unggulan"
                icon={GraduationCap}
                table="program_unggulan"
                canEdit={canManageContent}
                mapData={(item) => ({
                    id: item.id as number,
                    title: item.judul as string,
                    imageSrc: item.url_gambar as string
                })}
            />
        </section>
    );
}
