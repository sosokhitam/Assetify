import Joi from 'joi';

// 1. Validasi Input Tiket Baru (FR-03)
export const ticketSchema = Joi.object({
  asset_id: Joi.number().integer().required().messages({
    'number.base': 'Aset harus dipilih.',
    'any.required': 'Aset wajib diisi.'
  }),
  deskripsi_masalah: Joi.string().min(10).required().messages({
    'string.min': 'Deskripsi masalah minimal harus 10 karakter.',
    'any.required': 'Deskripsi masalah wajib diisi.'
  }),
  urgensi: Joi.string().valid('rendah', 'sedang', 'darurat').required().messages({
    'any.only': 'Tingkat urgensi harus berupa: rendah, sedang, atau darurat.'
  }),
  foto_kerusakan_url: Joi.string().uri().allow('', null)
});

// 2. Validasi Input Aset Baru (FR-02)
export const assetSchema = Joi.object({
  nama_aset: Joi.string().min(3).required(),
  kategori: Joi.string().required(),
  serial_number: Joi.string().required(),
  status: Joi.string().valid('tersedia', 'digunakan', 'rusak', 'perbaikan').default('tersedia'),
  divisi_id: Joi.number().integer().allow(null),
  foto_url: Joi.string().uri().allow('', null)
});