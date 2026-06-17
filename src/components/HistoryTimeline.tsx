/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  TrendingUp, 
  Coins, 
  Trash2, 
  Download, 
  Upload, 
  AlertCircle, 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  FileSpreadsheet, 
  Sparkles, 
  Share2 
} from 'lucide-react';
import { DailyLog } from '../types';
import { formatUZS, formatNum } from '../data';

interface HistoryTimelineProps {
  logs: DailyLog[];
  setLogs: (val: DailyLog[]) => void;
  theme?: 'light' | 'dark';
}

export default function HistoryTimeline({ logs, setLogs, theme = 'light' }: HistoryTimelineProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'YYYY-MM' or 'all'
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'profit-desc' | 'profit-asc'>('date-desc');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [exportNotification, setExportNotification] = useState<string | null>(null);
  const [deleteLogConfirmId, setDeleteLogConfirmId] = useState<string | null>(null);

  const isDark = theme === 'dark';

  // Extract unique months for filtering
  const monthsList = useMemo(() => {
    const list = new Set<string>();
    logs.forEach(log => {
      if (log.date) {
        list.add(log.date.substring(0, 7)); // 'YYYY-MM'
      }
    });
    return Array.from(list).sort().reverse();
  }, [logs]);

  // Handle local file import
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && (parsed.length === 0 || (parsed[0].date && parsed[0].bagsUsed))) {
          // Merge and avoid duplicates by date
          const merged = [...parsed];
          logs.forEach(oldLog => {
            if (!merged.some(m => m.date === oldLog.date)) {
              merged.push(oldLog);
            }
          });
          // Sort by date desc
          const sorted = merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setLogs(sorted);
          showNotification("Ma'lumotlar muvaffaqiyatli yuklab olindi va birlashtirildi!");
        } else {
          alert("Xato format! Tasdiqlangan Nonvoy Jurnali JSON faylini kiriting.");
        }
      } catch (err) {
        alert("Faylni o'qishda xato yuz berdi. Iltimos, to'g'ri JSON fayl ekanligini tekshiring.");
      }
    };
    reader.readAsText(file);
  };

  // Export logs to local JSON file
  const handleExportData = () => {
    if (logs.length === 0) {
      alert("Eksport qilish uchun tarixda hech qanday ma'lumot yo'q!");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nonvoy_tarixi_shaxsiy_jurnal_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification("Barcha ma'lumotlar telefon xotirasiga (fayl qilib) yuklandi!");
  };

  const showNotification = (message: string) => {
    setExportNotification(message);
    setTimeout(() => {
      setExportNotification(null);
    }, 4500);
  };

  // Toggle single log details accordion
  const toggleExpandLog = (id: string) => {
    setExpandedLogId(prev => (prev === id ? null : id));
  };

  // Filter & Sort core logs
  const filteredAndSortedLogs = useMemo(() => {
    let result = [...logs];

    // 1. Search term match
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(log => 
        (log.note && log.note.toLowerCase().includes(q)) ||
        log.date.includes(q) ||
        log.bagsUsed.toString().includes(q)
      );
    }

    // 2. Month selection
    if (selectedMonth !== 'all') {
      result = result.filter(log => log.date.startsWith(selectedMonth));
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'profit-desc') return b.calculatedProfit - a.calculatedProfit;
      if (sortBy === 'profit-asc') return a.calculatedProfit - b.calculatedProfit;
      return 0;
    });

    return result;
  }, [logs, searchTerm, selectedMonth, sortBy]);

  // Compute stats of filtered scope
  const statsSummary = useMemo(() => {
    const totalCount = filteredAndSortedLogs.length;
    if (totalCount === 0) return { totalProfit: 0, avgProfit: 0, totalBags: 0, maxProfitDay: null };

    let totalProfit = 0;
    let totalBags = 0;
    let maxProfit = -99999999;
    let maxProfitDay: DailyLog | null = null;

    filteredAndSortedLogs.forEach(log => {
      totalProfit += log.calculatedProfit;
      totalBags += log.bagsUsed;
      if (log.calculatedProfit > maxProfit) {
        maxProfit = log.calculatedProfit;
        maxProfitDay = log;
      }
    });

    return {
      totalProfit,
      avgProfit: Math.round(totalProfit / totalCount),
      totalBags,
      maxProfitDay
    };
  }, [filteredAndSortedLogs]);

  return (
    <div className={`rounded-3xl p-6 lg:p-8 border shadow-xl space-y-6 transition-all ${
      isDark 
        ? 'bg-[#1E1916]/80 backdrop-blur border-[#312620] shadow-[#0f0a08]/40' 
        : 'bg-white/95 backdrop-blur border-amber-100 shadow-amber-950/5'
    }`} id="history-timeline">

      {/* Backup banner alert */}
      {exportNotification && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-55 pointer-events-none bg-gradient-to-r from-amber-600 to-orange-650 text-[#1C1613] font-black text-xs md:text-sm px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 border border-amber-300">
          <Sparkles className="w-5 h-5 animate-pulse shrink-0" />
          <span>{exportNotification}</span>
        </div>
      )}

      {/* Header section with icons */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
        isDark ? 'border-[#312620]' : 'border-amber-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-amber-950/50 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>📜 Jurnal Tarixi va Arxiv</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Har bir kungi kiritilgan ma'lumotlarning to'liq, qidiruvli va filtri bor jurnali</p>
          </div>
        </div>

        {/* Data export/import touch controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* File input click hook */}
          <label className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:scale-103 active:scale-97 duration-205 ${
            isDark 
              ? 'border-[#3E322A] bg-[#2E241E]/40 hover:bg-[#3E2F26] text-slate-350' 
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 shadow-xs'
          }`}>
            <Upload className="w-3.5 h-3.5" />
            <span>Fayldan yuklash</span>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={handleImportFile} 
            />
          </label>

          <button
            type="button"
            onClick={handleExportData}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:scale-103 active:scale-97 duration-205 gold-glow-button ${
              isDark 
                ? 'bg-[#3E2E25]/85 text-amber-400 border border-amber-900/30' 
                : 'bg-amber-100/80 hover:bg-amber-100 border border-amber-200 text-amber-900 shadow-sm'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Telefon xotirasiga yozib olish (Download)</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter controls for quick phone navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Input on phone */}
        <div className="sm:col-span-5 relative">
          <label htmlFor="timeline-search" className="sr-only">Eslatma qidiruvi</label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          </div>
          <input
            type="text"
            id="timeline-search"
            placeholder="Izohlardan qidirish... (Masalan: 'un ya'lo')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-3 py-3 text-sm rounded-xl font-medium outline-none transition-all focus:ring-2 focus:ring-amber-500 ${
              isDark 
                ? 'bg-[#1a1512] border border-[#3E322A] text-slate-100 placeholder-slate-550' 
                : 'bg-[#FAF6F0] border border-amber-100 text-slate-800 placeholder-slate-400 shadow-inner'
            }`}
          />
        </div>

        {/* Month Selector dropdown */}
        <div className="sm:col-span-3">
          <label htmlFor="timeline-month" className="sr-only">Oyni tanlash</label>
          <div className="relative">
            <select
              id="timeline-month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`w-full px-3.5 py-3 text-sm rounded-xl font-bold appearance-none outline-none transition-all cursor-pointer focus:ring-2 focus:ring-amber-500 ${
                isDark 
                  ? 'bg-[#1a1512] border border-[#3E322A] text-slate-100' 
                  : 'bg-[#FAF6F0] border border-amber-100 text-slate-800 shadow-inner'
              }`}
            >
              <option value="all">📅 Barcha Oylar jurnali</option>
              {monthsList.map(m => {
                const parts = m.split('-');
                const uzbMonthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
                const monthName = uzbMonthNames[parseInt(parts[1]) - 1] || parts[1];
                return (
                  <option key={m} value={m}>{monthName} {parts[0]}-yil</option>
                );
              })}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Sort selector */}
        <div className="sm:col-span-4">
          <label htmlFor="timeline-sort" className="sr-only">Tartiblash</label>
          <div className="relative">
            <select
              id="timeline-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`w-full px-3.5 py-3 text-sm rounded-xl font-bold appearance-none outline-none transition-all cursor-pointer focus:ring-2 focus:ring-amber-500 ${
                isDark 
                  ? 'bg-[#1a1512] border border-[#3E322A] text-slate-100' 
                  : 'bg-[#FAF6F0] border border-amber-100 text-slate-800 shadow-inner'
              }`}
            >
              <option value="date-desc">🕒 Sanalar: Oldin yangisi</option>
              <option value="date-asc">🕒 Sanalar: Oldin eskisini</option>
              <option value="profit-desc">💰 Sof Foyda: Kamayish tartibida</option>
              <option value="profit-asc">💰 Sof Foyda: O'sish tartbida</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER METRICS bento grids */}
      {logs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Total logs counted */}
          <div className={`p-3.5 rounded-2xl border ${
            isDark ? 'bg-[#251E1B] border-[#3E322A]' : 'bg-slate-50 border-slate-100'
          }`}>
            <span className={`text-[9px] font-black uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tahlil qilingan kunlar</span>
            <span className={`text-lg font-black font-mono block ${isDark ? 'text-amber-400' : 'text-slate-850'}`}>{filteredAndSortedLogs.length} kun</span>
          </div>

          {/* Sum profit */}
          <div className={`p-3.5 rounded-2xl border ${
            isDark ? 'bg-[#251E1B] border-[#3E322A]' : 'bg-slate-50 border-slate-100'
          }`}>
            <span className={`text-[9px] font-black uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Filtrdagi jami foyda</span>
            <span className={`text-lg font-black font-mono block ${isDark ? 'text-emerald-400 font-bold' : 'text-emerald-700'}`}>{formatUZS(statsSummary.totalProfit)}</span>
          </div>

          {/* Average daily net */}
          <div className={`p-3.5 rounded-2xl border ${
            isDark ? 'bg-[#251E1B] border-[#3E322A]' : 'bg-slate-50 border-slate-100'
          }`}>
            <span className={`text-[9px] font-black uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>O'rtacha kunlik foyda</span>
            <span className={`text-lg font-black font-mono block ${isDark ? 'text-amber-400' : 'text-slate-800'}`}>{formatUZS(statsSummary.avgProfit)}</span>
          </div>

          {/* Most baraka day */}
          <div className={`p-3.5 rounded-2xl border ${
            isDark ? 'bg-[#251E1B] border-[#3E322A]' : 'bg-slate-50 border-slate-100'
          }`}>
            <span className={`text-[9px] font-black uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Eng barakali kun</span>
            <span className={`text-[11px] font-black font-sans leading-snug tracking-tight truncate block ${isDark ? 'text-orange-400' : 'text-amber-900 font-extrabold'}`}>
              {statsSummary.maxProfitDay ? `${statsSummary.maxProfitDay.date} (${formatNum(Math.round(statsSummary.maxProfitDay.calculatedProfit / 1000))}k)` : 'Mavjud emas'}
            </span>
          </div>
        </div>
      )}

      {/* DETAILED LOG TIMELINE: COMPLETELY OPTIMIZED FOR THE MOBILE SCREENS */}
      <div className="space-y-4">
        {filteredAndSortedLogs.map((log) => {
          const isExpanded = expandedLogId === log.id;
          const isProfit = log.calculatedProfit >= 0;
          const soldQuantity = log.totalBreads - log.damagedBreads;
          const totalCostRatio = log.calculatedRevenue > 0 ? (log.calculatedCost / log.calculatedRevenue) * 100 : 0;

          return (
            <div 
              key={log.id} 
              id={`log-timeline-card-${log.id}`}
              className={`p-4 lg:p-5 border rounded-2xl transition-all duration-300 premium-gold-card ${
                isExpanded 
                  ? (isDark ? 'bg-[#2A211D] border-amber-600/50' : 'bg-[#FFFDF9] border-amber-250 shadow-md')
                  : (isDark ? 'bg-[#241E1A]/60 border-[#322722]/60 hover:bg-[#251E1B]' : 'bg-white border-slate-150 hover:bg-slate-50')
              }`}
            >
              {/* PRIMARY VISIBLE HEADER ON PHONE (Large elements, easy touches) */}
              <div 
                className="flex items-center justify-between gap-3 cursor-pointer select-none"
                onClick={() => toggleExpandLog(log.id)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-black font-mono leading-none ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                      {log.date}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold font-mono uppercase tracking-wider ${
                      isDark ? 'bg-amber-950/75 text-amber-400' : 'bg-amber-50 text-amber-805'
                    }`}>
                      🍂 {log.bagsUsed} qop un
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 leading-none">
                    <span>Pishgan: {formatNum(log.totalBreads)} ta</span>
                    <span>•</span>
                    <span className="text-amber-550 text-amber-500 font-bold">Har qopdan {log.breadPerBag} non</span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div className="space-y-0.5">
                    <span className={`text-base font-black font-mono block ${
                      isProfit 
                        ? (isDark ? 'text-emerald-400' : 'text-emerald-700') 
                        : (isDark ? 'text-rose-400' : 'text-rose-650')
                    }`}>
                      {isProfit ? '+' : ''}{formatUZS(log.calculatedProfit)}
                    </span>
                    <span className="text-[9px] font-black uppercase text-slate-400 block leading-none">
                      Sof Daromad
                    </span>
                  </div>
                  
                  {/* Accordion expand indicator */}
                  <div className={`p-1.5 rounded-lg border transition-transform ${
                    isDark ? 'border-[#3E322A]' : 'border-slate-150'
                  } ${isExpanded ? 'rotate-180 text-amber-500' : 'text-slate-400'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* EXPANDED VIEW WITH ABSOLUTELY ALL DETAILS (Phone vertical layout card, perfect legibility) */}
              {isExpanded && (
                <div className={`mt-5 pt-4 border-t space-y-4 animate-fade-in text-xs ${
                  isDark ? 'border-[#3E322A]/60' : 'border-amber-100'
                }`}>
                  {/* Notes description if available */}
                  {log.note && (
                    <div className={`p-3 rounded-xl border italic leading-relaxed text-xs font-semibold ${
                      isDark ? 'bg-[#1C1613] border-amber-900/10 text-slate-350' : 'bg-amber-50/40 border-amber-200/40 text-slate-700'
                    }`}>
                      📝 <strong>Kunlik eslatma:</strong> "{log.note}"
                    </div>
                  )}

                  {/* Financial metrics list block */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    {/* Item 1: Jami tushum */}
                    <div className={`p-2.5 rounded-xl border ${
                      isDark ? 'bg-[#1A1512] border-[#3E322A]' : 'bg-slate-50 border-slate-100 shadow-inner'
                    }`}>
                      <span className="text-[9px] uppercase tracking-wide text-slate-400 block font-bold mb-0.5">Savdo (Tushum)</span>
                      <span className={`text-sm font-black font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {formatUZS(log.calculatedRevenue)}
                      </span>
                      <span className="text-[8.5px] block text-slate-450 mt-0.5 font-bold">
                        {formatNum(soldQuantity)} dona • {formatNum(log.sellingPrice)} so'mdan
                      </span>
                    </div>

                    {/* Item 2: Qorish xarajati */}
                    <div className={`p-2.5 rounded-xl border ${
                      isDark ? 'bg-[#1A1512] border-[#3E322A]' : 'bg-slate-50 border-slate-100 shadow-inner'
                    }`}>
                      <span className="text-[9px] uppercase tracking-wide text-slate-400 block font-bold mb-0.5">Un Xarajati</span>
                      <span className="text-sm font-black font-mono text-rose-500">
                        -{formatUZS(log.bagsUsed * log.flourPricePerBag)}
                      </span>
                      <span className="text-[8.5px] block text-slate-450 mt-0.5 font-bold">
                        {log.bagsUsed} qop un • {formatNum(log.flourPricePerBag)} so'mdan
                      </span>
                    </div>

                    {/* Item 3: Yoqilgi ishchilari */}
                    <div className={`p-2.5 rounded-xl border ${
                      isDark ? 'bg-[#1A1512] border-[#3E322A]' : 'bg-slate-50 border-slate-100 shadow-inner'
                    }`}>
                      <span className="text-[9px] uppercase tracking-wide text-slate-400 block font-bold mb-0.5">Boshqa xarajatlar</span>
                      <span className="text-sm font-black font-mono text-rose-500">
                        -{formatUZS(log.additionalExpenses)}
                      </span>
                      <span className="text-[8.5px] block text-slate-450 mt-0.5 font-bold">
                        Ishchi ulushi, o'tin va soliq
                      </span>
                    </div>

                    {/* Item 4: Sof Foyda marjasi */}
                    <div className={`p-2.5 rounded-xl border ${
                      isDark ? 'bg-[#1A1512] border-[#3E322A]' : 'bg-slate-50 border-slate-100 shadow-inner'
                    }`}>
                      <span className="text-[9px] uppercase tracking-wide text-slate-400 block font-bold mb-0.5">Foyda Koeffitsiyenti</span>
                      <span className={`text-sm font-black font-mono ${isDark ? 'text-amber-400' : 'text-slate-800'}`}>
                        {(100 - totalCostRatio).toFixed(1)}%
                      </span>
                      <span className="text-[8.5px] block text-slate-450 mt-0.5 font-bold animate-pulse">
                        Tannarx ulushi: {totalCostRatio.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Operational indicators details */}
                  <div className={`p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-[11px] font-bold ${
                    isDark ? 'bg-[#1F1916]' : 'bg-slate-50'
                  }`}>
                    <div className="flex flex-wrap items-center gap-3.5">
                      <span>Singan/Zarar: <span className="text-rose-500 font-black">{log.damagedBreads} dona</span></span>
                      <span className="text-slate-300">|</span>
                      <span>Sotilgan non: <span className="text-emerald-500 font-black">{soldQuantity} dona</span></span>
                      <span className="text-slate-300">|</span>
                      <span>1 qorim un: <span className="text-amber-500 font-black">50kg</span></span>
                    </div>
                    
                    {/* Delete entry confirmation row */}
                    {deleteLogConfirmId === log.id ? (
                      <div className="flex items-center gap-1.5 p-1 bg-rose-500/10 border border-rose-500/20 rounded-xl select-none animate-fade-in">
                        <span className="text-[10px] text-rose-400 font-extrabold uppercase px-1">Butkul o'chirilsinmi?</span>
                        <button
                          type="button"
                          onClick={() => {
                            setLogs(logs.filter(f => f.id !== log.id));
                            setDeleteLogConfirmId(null);
                          }}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-lg text-[10px] uppercase cursor-pointer whitespace-nowrap"
                        >
                          Ha, o'chirilsin
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteLogConfirmId(null)}
                          className={`px-2.5 py-1 font-black rounded-lg text-[10px] uppercase cursor-pointer ${
                            isDark ? 'bg-[#2a221e] hover:bg-[#342924] text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                          }`}
                        >
                          Yo'q
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteLogConfirmId(log.id)}
                        className="px-2.5 py-1 text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors border border-rose-500/20 flex items-center gap-1 cursor-pointer font-black"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Ushbu kunni tarixdan o'chirish</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredAndSortedLogs.length === 0 && (
          <div className={`p-10 rounded-2xl text-center border space-y-2.5 ${
            isDark ? 'border-[#3E322A]/40 bg-[#1A1512]/40' : 'border-slate-150 bg-slate-50'
          }`}>
            <AlertCircle className="w-10 h-10 text-amber-500/80 mx-auto animate-bounce" />
            <h4 className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-750 text-slate-705'}`}>Hech qanday ma'lumot topilmadi</h4>
            <p className="text-slate-400 text-xs font-semibold max-w-sm mx-auto leading-relaxed">
              Kritgan qidiruv kalitingiz yoki sanangiz bo'yicha ma'lumot yo'q. Qidiruvni tozalab ko'ring yoki kalkulyator orqali yangi kun hisobotini yozing.
            </p>
            {searchTerm || selectedMonth !== 'all' ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMonth('all');
                }}
                className="px-3.5 py-1.5 bg-amber-500 text-[#1C1613] font-bold text-xs rounded-xl hover:scale-103 transition-transform cursor-pointer shadow-sm"
              >
                Filtrlarni tozalash (Reset Filters)
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
