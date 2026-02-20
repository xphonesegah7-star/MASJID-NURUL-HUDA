/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
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

export default function App() {
  // State for Mosque Info
  const [mosqueInfo, setMosqueInfo] = useState<MosqueInfo>({
    name: 'MESJID NURUL HUDA KAMPUNG GUNUNG SARI',
    year: '1447 HIJRIYAH',
    subtitle: 'JADWAL MEMBERI TA\'JIL BUKA PUASA',
  });

  // State for Print Settings
  const [settings, setSettings] = useState<PrintSettings>({
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 5,
    marginRight: 5,
    scale: 1,
    donorsPerPage: 4,
    quality: 'TAJAM',
  });

  // State for Donors
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

  const [searchQuery, setSearchQuery] = useState('');

  const filteredDonors = useMemo(() => {
    return donors.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.date.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [donors, searchQuery]);

  const handleAddDonor = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setDonors([...donors, { 
      id: newId, 
      no: donors.length + 1, 
      name: 'Donatur Baru', 
      date: 'Tanggal Baru',
      date2: '',
      contributionType: 'Makanan / Uang'
    }]);
  };

  const handleDeleteDonor = (id: string) => {
    setDonors(donors.filter(d => d.id !== id));
  };

  const [isEditingMosque, setIsEditingMosque] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`File "${file.name}" terpilih. Fitur impor data akan segera hadir!`);
    }
  };

  const handleSaveDonor = () => {
    if (editingDonor) {
      setDonors(donors.map(d => d.id === editingDonor.id ? editingDonor : d));
      setEditingDonor(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-800 pb-12">
      {/* Print View (Hidden on Screen) */}
      <div className="print-only p-4 space-y-12">
        {donors.map((donor) => (
          <div key={donor.id} className="space-y-2">
            <div className="text-center">
              <h2 className="text-xl font-bold uppercase">SELAMAT MENUNAIKAN IBADAH PUASA {mosqueInfo.year}</h2>
              <h2 className="text-xl font-bold uppercase">{mosqueInfo.subtitle}</h2>
              <h2 className="text-xl font-bold uppercase text-slate-700">{mosqueInfo.name}</h2>
            </div>
            <table className="w-full border-collapse border border-black text-center font-serif">
              <thead>
                <tr>
                  <th className="border border-black p-2 w-12">No</th>
                  <th className="border border-black p-2">NAMA</th>
                  <th className="border border-black p-2">TANGGAL</th>
                  <th className="border border-black p-2">JENIS SUMBANGAN</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-4">{donor.no}</td>
                  <td className="border border-black p-4 font-bold">{donor.name}</td>
                  <td className="border border-black p-4">
                    <div>{donor.date}</div>
                    {donor.date2 && <div>{donor.date2}</div>}
                  </td>
                  <td className="border border-black p-4">{donor.contributionType}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Header */}
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

            <div className="grid grid-cols-3 gap-6 mt-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Skala (%)</label>
                <input 
                  type="number" 
                  value={settings.scale}
                  onChange={(e) => setSettings({...settings, scale: parseFloat(e.target.value)})}
                  className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#10b981]/20"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Donatur/Hal</label>
                <input 
                  type="number" 
                  value={settings.donorsPerPage}
                  onChange={(e) => setSettings({...settings, donorsPerPage: parseInt(e.target.value)})}
                  className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#10b981]/20"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Kualitas</label>
                <select 
                  value={settings.quality}
                  onChange={(e) => setSettings({...settings, quality: e.target.value as 'TAJAM' | 'STANDAR'})}
                  className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold uppercase text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 cursor-pointer"
                >
                  <option value="TAJAM">TAJAM</option>
                  <option value="STANDAR">STANDAR</option>
                </select>
              </div>
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
                accept=".csv,.xlsx,.xls"
              />
              <button 
                onClick={handleUploadClick}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Upload className="w-5 h-5 text-blue-500" />
                UPLOAD
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
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                EXCEL
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-[#eff6ff] text-blue-600 rounded-2xl font-bold hover:bg-blue-100 transition-colors">
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
    </div>
  );
}
