"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Lightbox } from "@/components/Lightbox";
import { createClient } from "@/lib/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import {
  uploadFile,
  deleteFile,
  validateImageFile,
  validateFileSize,
} from "@/lib/supabase/storage";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  Image as ImageIcon,
} from "lucide-react";

interface GalleryImage {
  id: number;
  src: string;
  title: string;
  category: string;
  kategori_id?: number;
}

interface DbCategory {
  id: number;
  nama: string;
}

const initialFormData = {
  judul: "",
  url_gambar: "",
  kategori_id: 0,
  urutan_tampil: 1,
  aktif: true,
};

export default function GaleriPage() {
  const { canManageContent } = useAdmin();
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<string[]>(["Semua"]);
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setImageLoadingStates] = useState<Record<number, boolean>>({});

  // CRUD state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setImageLoadingStates({}); // Reset loading states
    console.log("🔄 Fetching gallery data...");
    const supabase = createClient();
    try {
      // Fetch categories
      const { data: categoriesData, error: catError } = await supabase
        .from("gallery_categories")
        .select("*")
        .eq("aktif", true)
        .order("urutan_tampil", { ascending: true });

      if (catError) {
        console.error("❌ Error fetching categories:", catError);
        setCategories(["Semua"]);
        setDbCategories([]);
      } else {
        const categoryNames =
          categoriesData?.map((cat: DbCategory) => cat.nama) || [];
        setCategories(["Semua", ...categoryNames]);
        setDbCategories(categoriesData || []);
      }

      // Fetch images
      const { data: imagesData, error: imgError } = await supabase
        .from("gallery_images")
        .select(
          `
          id,
          judul,
          url_gambar,
          kategori_id,
          aktif
        `,
        )
        .eq("aktif", true)
        .order("urutan_tampil", { ascending: true });

      if (imgError) {
        console.error("❌ Error fetching images:", imgError);
        console.error("Error details:", imgError.message);
        setImages([]);
      } else {
        console.log("✅ Fetched images count:", imagesData?.length || 0);
        console.log("📊 Images data:", imagesData);

        // Get category map for lookup
        const categoryMap = new Map<number, string>();
        categoriesData?.forEach((cat: DbCategory) => {
          categoryMap.set(cat.id, cat.nama);
        });

        // Transform data to match GalleryImage interface
        const transformedImages: GalleryImage[] =
          imagesData?.map(
            (img: {
              id: number;
              judul: string;
              url_gambar: string;
              kategori_id: number;
            }) => {
              const categoryName =
                categoryMap.get(img.kategori_id) || "Lainnya";
              return {
                id: img.id,
                src: img.url_gambar,
                title: img.judul,
                category: categoryName,
                kategori_id: img.kategori_id,
              };
            },
          ) || [];
        setImages(transformedImages);
      }
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      setCategories(["Semua"]);
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // CRUD Functions
  const resetForm = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const openAddDialog = () => {
    resetForm();
    if (dbCategories.length > 0) {
      setFormData({ ...initialFormData, kategori_id: dbCategories[0].id });
    }
    setIsDialogOpen(true);
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingId(image.id);
    setFormData({
      judul: image.title,
      url_gambar: image.src,
      kategori_id: image.kategori_id || 0,
      urutan_tampil: 1,
      aktif: true,
    });
    setPreviewUrl(image.src);
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateImageFile(file)) {
      alert("File harus berupa gambar (JPG, PNG, GIF, WebP)");
      return;
    }
    if (!validateFileSize(file, 5)) {
      alert("Ukuran file maksimal 5MB");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const supabase = createClient();

    try {
      let imageUrl = formData.url_gambar;

      if (selectedFile) {
        const uploadedUrl = await uploadFile(selectedFile, "gallery", "images");
        if (!uploadedUrl) {
          alert("Error uploading gambar");
          setIsSaving(false);
          return;
        }
        imageUrl = uploadedUrl;
        if (editingId && formData.url_gambar) {
          await deleteFile(formData.url_gambar, "gallery");
        }
      }

      const dataToSave = { ...formData, url_gambar: imageUrl };

      if (editingId) {
        const { data, error } = await supabase
          .from("gallery_images")
          .update(dataToSave)
          .eq("id", editingId)
          .select();

        if (error || !data?.length) {
          alert("Error: " + (error?.message || "Gagal menyimpan"));
          return;
        }
        alert("Gambar berhasil diupdate!");
      } else {
        const { data, error } = await supabase
          .from("gallery_images")
          .insert([dataToSave])
          .select();

        if (error || !data?.length) {
          alert("Error: " + (error?.message || "Gagal menyimpan"));
          return;
        }
        alert("Gambar berhasil ditambahkan!");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, imageUrl: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus gambar ini?")) return;

    const supabase = createClient();

    if (imageUrl) {
      await deleteFile(imageUrl, "gallery");
    }

    const { error } = await supabase
      .from("gallery_images")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    alert("Gambar berhasil dihapus!");
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredImages = useMemo(() => {
    if (activeFilter === "Semua") {
      return images;
    }
    return images.filter((image) => image.category === activeFilter);
  }, [activeFilter, images]);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToNext = () => {
    setSelectedImageIndex(
      (prevIndex) => (prevIndex + 1) % filteredImages.length,
    );
  };

  const goToPrev = () => {
    setSelectedImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + filteredImages.length) % filteredImages.length,
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="py-16 md:py-24 bg-gray-50 border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
              Galeri <span className="text-emerald-600">Kegiatan</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Dokumentasi visual dari berbagai kegiatan dan acara yang
              diselenggarakan di Masjid Al-Ikhlas.
            </p>
            {canManageContent && (
              <button
                onClick={openAddDialog}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Tambah Gambar
              </button>
            )}
          </div>

          <div className="flex justify-center flex-wrap gap-2 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
                  activeFilter === category
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-emerald-100 hover:text-emerald-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <p className="mt-4 text-gray-600">Memuat galeri...</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-20 h-20 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Belum Ada Foto
              </h3>
              <p className="text-gray-500">
                Galeri foto masih kosong. Silakan tambahkan foto melalui admin
                panel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredImages.map((image: GalleryImage, index: number) => (
                <div
                  key={image.id}
                  className="group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 relative"
                >
                  {/* Admin Actions */}
                  {canManageContent && (
                    <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(image);
                        }}
                        className="p-2 bg-amber-500 hover:bg-amber-600 rounded-full text-white shadow-lg"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(image.id, image.src);
                        }}
                        className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Image */}
                  <div
                    className="overflow-hidden"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={image.src}
                      alt={image.title}
                      className="w-full h-60 object-cover transform transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Title and category below image */}
                  <div className="p-4 bg-white">
                    <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-2">
                      {image.title}
                    </h3>
                    <p className="text-emerald-600 text-sm font-medium">
                      {image.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightboxOpen && (
        <Lightbox
          images={filteredImages}
          currentIndex={selectedImageIndex}
          onClose={closeLightbox}
          onPrev={goToPrev}
          onNext={goToNext}
        />
      )}

      {/* Admin Dialog Form */}
      {canManageContent && isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit Gambar" : "Tambah Gambar"}
              </h3>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul *
                </label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) =>
                    setFormData({ ...formData, judul: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori *
                </label>
                <select
                  value={formData.kategori_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kategori_id: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {dbCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gambar *
                </label>
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl(null);
                        setSelectedFile(null);
                        setFormData({ ...formData, url_gambar: "" });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-200 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <ImageIcon className="w-10 h-10 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Klik untuk upload gambar
                    </p>
                    <p className="text-xs text-gray-400">
                      JPG, PNG, GIF, WebP (Max. 5MB)
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </label>
                )}
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={isSaving || (!selectedFile && !formData.url_gambar)}
                >
                  {isSaving ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {editingId ? "Update" : "Simpan"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
