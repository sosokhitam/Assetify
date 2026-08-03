import React from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, FileSpreadsheet } from 'lucide-react';

export default function ExportButton({ data, filename, title }) {
  // 1. Fungsi Export ke Excel
  const exportToExcel = () => {
    if (!data || data.length === 0) {
      alert('Tidak ada data untuk diexport!');
      return;
    }

    const cleanData = data.map((item, index) => {
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

    const keys = Object.keys(data[0]).filter(k => k !== 'id' && k !== 'created_at');
    const headers = keys.map(k => k.toUpperCase().replace(/_/g, ' '));
    const rows = data.map(item => keys.map(key => item[key] ?? '-'));

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 32,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`${filename}_${Date.now()}.pdf`);
  };

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      {/* Tombol Excel */}
      <button
        onClick={exportToExcel}
        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-semibold transition shadow-md active:scale-95 cursor-pointer"
        title="Download Excel"
      >
        <FileSpreadsheet className="w-4 h-4 shrink-0" />
        <span>Excel</span>
      </button>

      {/* Tombol PDF */}
      <button
        onClick={exportToPDF}
        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-semibold transition shadow-md active:scale-95 cursor-pointer"
        title="Download PDF"
      >
        <FileText className="w-4 h-4 shrink-0" />
        <span>PDF</span>
      </button>
    </div>
  );
}