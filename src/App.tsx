/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileText, 
  Printer, 
  Settings2, 
  Layout, 
  Search, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  FileType, 
  ChevronRight,
  Edit3,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MosqueInfo, PrintSettings, Donor } from './types';

const STORAGE_KEY = 'jadwal_tajil_data';

export default function App() {
  // Initial States
  const [mosqueInfo, setMosqueInfo] = useState<MosqueInfo>({
    name: 'MESJID NURUL HUDA KAMPUNG GUNUNG SARI',
    year: '1447 HIJRIYAH',
    subtitle: 'JADWAL MEMBERI TA\'JIL BUKA PUASA',
  });

  const [settings, setSettings] = useState<PrintSettings>({
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 5,
    marginRight: 5,
    scale: 100,
    donorsPerPage: 4,
    quality: 'TAJAM',
  });

  const [donors, setDonors] = useState<Donor[]>([
    { 
      id: '1', 
      no: 7, 
      name: 'ARIANTO/ATUT', 
      date: '19 Februari 2026', 
      date2: '06 Maret 2026', 
      contributionType: 'Makanan / Uang' 
    },
    { 
      id: '2', 
      no: 8, 
      name: 'SAPA', 
      date: '20 Februari 2026', 
      date2: '06 Maret 2026', 
      contributionType: 'Makanan / Uang' 
    },
    { 
      id: '3', 
      no: 9, 
      name: 'BAHAR', 
      date: '20 Februari 2026', 
      date2: '06 Maret 2026', 
      contributionType: 'Makanan / Uang' 
    },
  ]);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.mosqueInfo) setMosqueInfo(parsed.mosqueInfo);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.donors) setDonors(parsed.donors);
      } catch (e) {
        console.error('Failed to load data from localStorage', e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    const data = { mosqueInfo, settings, donors };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [mosqueInfo, settings, donors]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingMosque, setIsEditingMosque] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDonors = useMemo(() => {
    return donors.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.contributionType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [donors, searchQuery]);

  const handleAddDonor = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const nextNo = donors.length > 0 ? Math.max(...donors.map(d => d.no)) + 1 : 1;
    setDonors([...donors, { 
      id: newId, 
      no: nextNo, 
      name: 'Donatur Baru', 
      date: 'Tanggal Baru',
      date2: '',
      contributionType: 'Makanan / Uang'
    }]);
  };

  const handleDeleteDonor = (id: string) => {
    setDonors(donors.filter(d => d.id !== id));
  };

  const handlePrint = () => {
    setIsPreviewMode(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '';
    
    // If it's already in a long format (e.g. from manual input or previous save)
    if (dateStr.includes('Januari') || dateStr.includes('Februari') || dateStr.includes('Maret')) {
      return dateStr;
    }

    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parseInt(parts[1]);
      const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      if (month >= 1 && month <= 12) {
        return `${day} ${months[month - 1]} ${year}`;
      }
    }
    return dateStr;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // Use raw: false to get formatted strings from Excel
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as any[][];
      
      const newDonors: Donor[] = [];
      
      jsonData.slice(1).forEach((row) => {
        if (row.length >= 2 && row[1]) {
          newDonors.push({
            id: Math.random().toString(36).substr(2, 9),
            no: parseInt(row[0]) || (donors.length + newDonors.length + 1),
            name: String(row[1]).toUpperCase(),
            date: formatDateString(String(row[2] || '')),
            date2: formatDateString(String(row[3] || '')),
            contributionType: String(row[4] || 'Makanan / Uang')
          });
        }
      });

      if (newDonors.length > 0) {
        setDonors([...donors, ...newDonors]);
        alert(`Berhasil mengimpor ${newDonors.length} data donatur dari Excel.`);
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveDonor = () => {
    if (editingDonor) {
      setDonors(donors.map(d => d.id === editingDonor.id ? editingDonor : d));
      setEditingDonor(null);
    }
  };

  const downloadTemplate = () => {
    const headers = ['No', 'Nama', 'Tanggal Pertama', 'Tanggal Kedua', 'Jenis Sumbangan'];
    const sampleData = [
      ['1', 'SYAMSIA', '19/02/26', '06/03/26', 'Makanan / Uang'],
      ['2', 'SINTA/NI', '19/02/26', '06/03/26', 'Makanan / Uang'],
      ['3', 'ANGGIN', '19/02/26', '06/03/26', 'Makanan / Uang']
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "template_input_tajil.xlsx");
  };

  const exportToExcel = () => {
    const headers = ['No', 'Nama Donatur', 'Tanggal 1', 'Tanggal 2', 'Jenis Sumbangan'];
    const rows = donors.map(d => [d.no, d.name, d.date, d.date2 || '', d.contributionType]);
    
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Donatur");
    XLSX.writeFile(workbook, "jadwal_tajil.xlsx");
  };

  const exportToWord = () => {
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export</title></head>
      <body>
        <div style="text-align: center;">
          <h2>SELAMAT MENUNAIKAN IBADAH PUASA ${mosqueInfo.year}</h2>
          <h3>${mosqueInfo.subtitle}</h3>
          <h2 style="color: #5c4033;">${mosqueInfo.name}</h2>
        </div>
        <table border="1" style="width: 100%; border-collapse: collapse; text-align: center;">
          <thead>
            <tr>
              <th>No</th>
              <th>NAMA</th>
              <th>TANGGAL</th>
              <th>JENIS SUMBANGAN</th>
            </tr>
          </thead>
          <tbody>
            ${donors.map(d => `
              <tr>
                <td>${d.no}</td>
                <td><b>${d.name}</b></td>
                <td>${d.date}<br>${d.date2 || ''}</td>
                <td>${d.contributionType}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "jadwal_tajil.doc");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const donorChunks = useMemo(() => {
    const chunks = [];
    const perPage = settings.donorsPerPage || 1;
    for (let i = 0; i < donors.length; i += perPage) {
      chunks.push(donors.slice(i, i + perPage));
    }
    return chunks;
  }, [donors, settings.donorsPerPage]);

  return (
    <div className={`min-h-screen ${isPreviewMode ? 'bg-slate-800' : 'bg-[#f1f5f9]'} font-sans text-slate-800 pb-12`}>
      {/* Preview Mode Overlay Controls */}
      {isPreviewMode && (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-slate-900/90 backdrop-blur-md p-4 flex items-center justify-center gap-4 no-print shadow-2xl">
          <button 
            onClick={() => setIsPreviewMode(false)}
            className="px-6 py-2 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-all flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            KEMBALI KE EDITOR
          </button>
          <button 
            onClick={() => window.print()}
            className="px-8 py-2 bg-[#10b981] text-white rounded-xl font-bold hover:bg-[#059669] transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Printer className="w-4 h-4" />
            CETAK SEKARANG
          </button>
        </div>
      )}

      {/* Print View (Hidden on Screen unless isPreviewMode is true) */}
      <div className={`${isPreviewMode ? 'flex flex-col items-center pt-24 gap-8 pb-24 overflow-y-auto h-screen' : 'print-only'} font-serif`}>
        {donorChunks.map((chunk, pageIndex) => (
          <div 
            key={pageIndex} 
            className={`${isPreviewMode ? 'shadow-2xl mb-8' : 'break-after-page'} relative`}
            style={{
              paddingTop: `${settings.marginTop}mm`,
              paddingBottom: `${settings.marginBottom}mm`,
              paddingLeft: `${settings.marginLeft}mm`,
              paddingRight: `${settings.marginRight}mm`,
              minHeight: '297mm', // A4 Height
              width: '210mm', // A4 Width
              backgroundColor: 'white'
            }}
          >
            <div 
              style={{ 
                transform: `scale(${settings.scale / 100})`, 
                transformOrigin: 'top center',
                width: '100%'
              }}
              className="space-y-6"
            >
              {chunk.map((donor) => (
                <div key={donor.id} className="break-inside-avoid">
                  <div className="text-center mb-4">
                    <div className="text-2xl mb-2 font-serif">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
                    <h2 className="text-[1.1rem] font-bold uppercase leading-tight text-black">SELAMAT MENUNAIKAN IBADAH PUASA {mosqueInfo.year}</h2>
                    <h2 className="text-[1.1rem] font-bold uppercase leading-tight text-black">{mosqueInfo.subtitle}</h2>
                    <h2 className="text-[1.1rem] font-bold uppercase leading-tight text-black">{mosqueInfo.name}</h2>
                  </div>
                  <table className="w-full border-collapse border-2 border-black text-center font-serif text-[1rem]">
                    <thead>
                      <tr className="border-b-2 border-black bg-slate-50/10">
                        <th className="border-2 border-black p-2 w-[8%] font-bold">No</th>
                        <th className="border-2 border-black p-2 w-[32%] font-bold">NAMA</th>
                        <th className="border-2 border-black p-2 w-[25%] font-bold">TANGGAL</th>
                        <th className="border-2 border-black p-2 w-[35%] font-bold">JENIS SUMBANGAN</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border-2 border-black p-4 align-middle">{donor.no}</td>
                        <td className="border-2 border-black p-4 font-bold align-middle uppercase">{donor.name}</td>
                        <td className="border-2 border-black p-4 align-middle">
                          {(() => {
                            const dateParts = donor.date.split(' ');
                            if (dateParts.length === 3) {
                              return (
                                <>
                                  <div className="leading-tight font-bold">{dateParts[0]} {dateParts[1]}</div>
                                  <div className="leading-tight font-bold">{dateParts[2]}</div>
                                </>
                              );
                            }
                            return <div className="leading-tight font-bold">{donor.date}</div>;
                          })()}
                          {donor.date2 && <div className="leading-tight font-bold mt-1">{donor.date2}</div>}
                        </td>
                        <td className="border-2 border-black p-4 align-middle font-bold">{donor.contributionType}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      {!isPreviewMode && (
        <header className="bg-[#1e293b] text-white px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-50 no-print">
        <div className="flex items-center gap-3">
          <div className="bg-[#10b981] p-2 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Editor Jadwal Ta'jil</h1>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-transparent border border-slate-500 hover:bg-slate-700 px-6 py-2 rounded-xl flex items-center gap-2 transition-all font-medium"
        >
          <Printer className="w-4 h-4" />
          Pratinjau
        </button>
      </header>
      )}

      {!isPreviewMode && (
        <main className="max-w-7xl mx-auto p-6 space-y-8 no-print">
        {/* Donor Edit Modal */}
        <AnimatePresence>
          {editingDonor && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
              >
                <h3 className="text-xl font-bold mb-6">Ubah Data Donatur</h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">No Urut</label>
                    <input 
                      type="number" 
                      value={editingDonor.no}
                      onChange={(e) => setEditingDonor({...editingDonor, no: parseInt(e.target.value)})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nama Donatur</label>
                    <input 
                      type="text" 
                      value={editingDonor.name}
                      onChange={(e) => setEditingDonor({...editingDonor, name: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Jadwal Tanggal (Baris 1)</label>
                    <input 
                      type="text" 
                      value={editingDonor.date}
                      onChange={(e) => setEditingDonor({...editingDonor, date: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Jadwal Tanggal (Baris 2)</label>
                    <input 
                      type="text" 
                      value={editingDonor.date2 || ''}
                      onChange={(e) => setEditingDonor({...editingDonor, date2: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Jenis Sumbangan</label>
                    <input 
                      type="text" 
                      value={editingDonor.contributionType}
                      onChange={(e) => setEditingDonor({...editingDonor, contributionType: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => setEditingDonor(null)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleSaveDonor}
                    className="flex-1 py-3 bg-[#10b981] text-white font-bold rounded-xl hover:bg-[#059669] transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isEditingMosque && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
              >
                <h3 className="text-xl font-bold mb-6">Ubah Kepala Surat</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nama Masjid</label>
                    <input 
                      type="text" 
                      value={mosqueInfo.name}
                      onChange={(e) => setMosqueInfo({...mosqueInfo, name: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tahun Hijriyah</label>
                    <input 
                      type="text" 
                      value={mosqueInfo.year}
                      onChange={(e) => setMosqueInfo({...mosqueInfo, year: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Sub Judul</label>
                    <input 
                      type="text" 
                      value={mosqueInfo.subtitle}
                      onChange={(e) => setMosqueInfo({...mosqueInfo, subtitle: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => setIsEditingMosque(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => setIsEditingMosque(false)}
                    className="flex-1 py-3 bg-[#10b981] text-white font-bold rounded-xl hover:bg-[#059669] transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Top Cards Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Letterhead Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Settings2 className="w-6 h-6 text-[#10b981]" />
                <h2 className="text-lg font-bold uppercase tracking-wide">Kepala Surat</h2>
              </div>
              <button 
                onClick={() => setIsEditingMosque(true)}
                className="text-sm font-bold text-slate-400 border border-slate-200 px-4 py-1.5 rounded-lg hover:bg-slate-50 transition-colors uppercase"
              >
                Ubah
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Nama Masjid</label>
                <div className="bg-slate-50 p-4 rounded-2xl text-slate-500 font-bold tracking-wide">
                  {mosqueInfo.name}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tahun Hijriyah</label>
                <div className="bg-slate-50 p-4 rounded-2xl text-slate-500 font-bold tracking-wide">
                  {mosqueInfo.year}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Sub Judul</label>
                <div className="bg-slate-50 p-4 rounded-2xl text-slate-500 font-bold tracking-wide">
                  {mosqueInfo.subtitle}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Skala (%)</label>
                  <input 
                    type="number" 
                    value={settings.scale}
                    onChange={(e) => setSettings({...settings, scale: parseFloat(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Donatur/Hal</label>
                  <input 
                    type="number" 
                    value={settings.donorsPerPage}
                    onChange={(e) => setSettings({...settings, donorsPerPage: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Kualitas</label>
                  <select 
                    value={settings.quality}
                    onChange={(e) => setSettings({...settings, quality: e.target.value as 'TAJAM' | 'STANDAR'})}
                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold uppercase text-[10px] tracking-widest focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 cursor-pointer"
                  >
                    <option value="TAJAM">TAJAM</option>
                    <option value="STANDAR">STANDAR</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Margin Settings Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200"
          >
            <div className="flex items-center gap-3 mb-8">
              <Layout className="w-6 h-6 text-[#10b981]" />
              <h2 className="text-lg font-bold uppercase tracking-wide">Presisi Margin (A4 Full)</h2>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {[
                { label: 'Margin Atas', key: 'marginTop' },
                { label: 'Margin Bawah', key: 'marginBottom' },
                { label: 'Margin Kiri', key: 'marginLeft' },
                { label: 'Margin Kanan', key: 'marginRight' },
              ].map((m) => (
                <div key={m.key}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{m.label}</label>
                    <span className="text-sm font-bold">{settings[m.key as keyof PrintSettings]}mm</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    value={settings[m.key as keyof PrintSettings] as number}
                    onChange={(e) => setSettings({...settings, [m.key]: parseInt(e.target.value)})}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#10b981]"
                  />
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                Gunakan pengaturan ini untuk menyesuaikan posisi cetak agar pas dengan kertas A4. 
                Perubahan akan langsung terlihat pada mode pratinjau.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Table Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden"
        >
          {/* Table Toolbar */}
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 font-medium"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".xlsx,.xls"
              />
              <button 
                onClick={handleUploadClick}
                title="Upload Excel Data"
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Upload className="w-5 h-5 text-blue-500" />
                UPLOAD
              </button>
              <button 
                onClick={downloadTemplate}
                title="Download Template Excel"
                className="p-3 bg-blue-50 text-blue-500 rounded-2xl hover:bg-blue-100 transition-colors"
              >
                <FileText className="w-5 h-5" />
              </button>
              <button 
                onClick={handleAddDonor}
                className="flex-1 md:flex-none bg-[#059669] text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#047857] transition-all shadow-lg shadow-[#059669]/20"
              >
                <Plus className="w-5 h-5" />
                TAMBAH
              </button>
              <button 
                onClick={() => {
                  if (confirm('Hapus semua data donatur?')) {
                    setDonors([]);
                  }
                }}
                className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                onClick={exportToExcel}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                EXCEL
              </button>
              <button 
                onClick={exportToWord}
                className="flex items-center gap-2 px-6 py-3 bg-[#eff6ff] text-blue-600 rounded-2xl font-bold hover:bg-blue-100 transition-colors"
              >
                <FileType className="w-5 h-5" />
                WORD
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nama Donatur</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Jadwal Tanggal</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Jenis Sumbangan</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Opsi</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredDonors.map((donor) => (
                    <motion.tr 
                      key={donor.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <td className="px-8 py-5 font-bold text-slate-400">{donor.no}</td>
                      <td className="px-8 py-5 font-bold text-slate-600">{donor.name}</td>
                      <td className="px-8 py-5 font-bold text-slate-500">
                        <div>{donor.date}</div>
                        {donor.date2 && <div className="text-xs opacity-60">{donor.date2}</div>}
                      </td>
                      <td className="px-8 py-5 font-bold text-slate-500">{donor.contributionType}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setEditingDonor(donor)}
                            className="p-2 text-slate-400 hover:text-[#10b981] transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteDonor(donor.id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredDonors.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                      Tidak ada data donatur ditemukan...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
      )}
    </div>
  );
}
