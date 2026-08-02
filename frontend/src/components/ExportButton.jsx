import React from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Direct import untuk kompatibilitas ESM/Vite
import { FileText, FileSpreadsheet } from 'lucide-react';

export default function ExportButton({ data, filename, title }) {
  // 1. Fungsi Export ke Excel
  const exportToExcel = () => {
    if (!data || data.length === 0) {
      alert('Tidak ada data untuk diexport!');
      return;
    }

    // Ubah data mentah agar bersih saat masuk excel
    const cleanData = data.map((item, index) => {
      // Jika data sudah memiliki property 'No', gunakan itu; jika belum, buat otomatis
      if ('No' in item) {
        return item;
      }
      return {
        No: index + 1,
        ...item
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(cleanData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
    XLSX.writeFile(workbook, `${filename}_${Date.now()}.xlsx`);
  };

  // 2. Fungsi Export ke PDF
  const exportToPDF = () => {
    if (!data || data.length === 0) {
      alert('Tidak ada data untuk diexport!');
      return;
    }

    const doc = new jsPDF();

    // Judul Dokumen
    doc.setFontSize(16);
    doc.text(title || 'Laporan Assetify IT', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 26);

    // Ambil kunci object pertama sebagai header tabel secara otomatis
    // Filter field internal/ID jika ada
    const keys = Object.keys(data[0]).filter(k => k !== 'id' && k !== 'created_at');
    const headers = keys.map(k => k.toUpperCase().replace(/_/g, ' '));
    
    const rows = data.map(item => keys.map(key => item[key] ?? '-'));

    // Memanggil autoTable secara eksplisit dengan mengoper instance 'doc'
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 32,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] } // Warna Indigo Tailwind
    });

    doc.save(`${filename}_${Date.now()}.pdf`);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportToExcel}
        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition shadow-sm"
        title="Download Excel"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Excel
      </button>
      <button
        onClick={exportToPDF}
        className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition shadow-sm"
        title="Download PDF"
      >
        <FileText className="w-4 h-4" />
        PDF
      </button>
    </div>
  );
}