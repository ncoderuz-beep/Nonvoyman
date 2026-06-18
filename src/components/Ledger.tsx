/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Trash2, TrendingUp, BarChart3, Plus, ArrowUpRight, DollarSign, Award, ThumbsUp, AlertTriangle } from 'lucide-react';
import { DailyLog } from '../types';
import { formatUZS, formatNum } from '../data';

interface LedgerProps {
  logs: DailyLog[];
  setLogs: (val: DailyLog[]) => void;
  onAddLog: (newLog: DailyLog) => void;
  // Current values to pre-populate form
  currentBags: number;
  currentYield: number;
  currentFlourPrice: number;
  currentSellingPrice: number;
  calculatedVariableExpenses: number;
  calculatedFixedExpenses: number;
  theme?: 'light' | 'dark';
}

export default function Ledger({
  logs,
  setLogs,
  onAddLog,
  currentBags,
  currentYield,
  currentFlourPrice,
  currentSellingPrice,
  calculatedVariableExpenses,
  calculatedFixedExpenses,
  theme = 'light'
}: LedgerProps) {

  // Form states
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formBags, setFormBags] = useState<number>(currentBags);
  const [formYield, setFormYield] = useState<number>(currentYield);
  const [formDamaged, setFormDamaged] = useState<number>(5); // default minor losses
  const [formPriceInput, setFormPriceInput] = useState<number>(currentSellingPrice);
  const [formFlourPrice, setFormFlourPrice] = useState<number>(currentFlourPrice);
  const [formNote, setFormNote] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Synchronize form when props change
  React.useEffect(() => {
    setFormBags(currentBags);
    setFormYield(currentYield);
    setFormPriceInput(currentSellingPrice);
    setFormFlourPrice(currentFlourPrice);
  }, [currentBags, currentYield, currentSellingPrice, currentFlourPrice]);

  // Handle manual log addition
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const bags = Number(formBags);
    const yld = Number(formYield);
    const damaged = Number(formDamaged);
    const price = Number(formPriceInput);
    const flPrice = Number(formFlourPrice);

    const totalBreads = bags * yld;
    const billableBreads = Math.max(0, totalBreads - damaged);

    const revenue = billableBreads * price;

    // cost of flour + proportion of variables + fixed daily expenses
    const unitVariableCost = currentBags > 0 ? (calculatedVariableExpenses / currentBags) : 0;
    const cost = (bags * flPrice) + (bags * unitVariableCost) + calculatedFixedExpenses;
    const profit = revenue - cost;

    const newLog: DailyLog = {
      id: 'log-' + Date.now(),
      date: formDate,
      bagsUsed: bags,
      breadPerBag: yld,
      totalBreads,
      damagedBreads: damaged,
      sellingPrice: price,
      flourPricePerBag: flPrice,
      additionalExpenses: (bags * unitVariableCost) + calculatedFixedExpenses,
      calculatedRevenue: revenue,
      calculatedCost: cost,
      calculatedProfit: profit,
      note: formNote.trim() || undefined
    };

    onAddLog(newLog);
    setFormNote('');
    setFormDamaged(5);
    setShowAddForm(false);
  };

  // Delete log item
  const handleDeleteLog = (id: string) => {
    if (confirm("Haqiqatan ham ushbu kunlik hisobotni o'chirib tashlamoqchimisiz?")) {
      setLogs(logs.filter(item => item.id !== id));
    }
  };

  // Clear all
  const handleClearAll = () => {
    if (confirm("Barcha yozuvlarni butkul o'chirmoqchimisiz? Shaxsiy statistikangiz nollashtiriladi.")) {
      setLogs([]);
    }
  };

  // Render mock ledger items to demonstrate layout
  const handleLoadSampleData = () => {
    const today = new Date();
    const sampleLogs: DailyLog[] = [
      {
        id: 'sample-1',
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bagsUsed: 3,
        breadPerBag: 395,
        totalBreads: 1185,
        damagedBreads: 12,
        sellingPrice: 3000,
        flourPricePerBag: 280000,
        additionalExpenses: 30000 + (3 * 53000), // fixed + per_bag
        calculatedRevenue: 1173 * 3000,
        calculatedCost: (3 * 280000) + 30000 + (3 * 53000),
        calculatedProfit: (1173 * 3000) - ((3 * 280000) + 30000 + (3 * 53000)),
        note: "Yaxshi tandir bo'ldi, nonlar qizg'ish chiqdi."
      },
      {
        id: 'sample-2',
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bagsUsed: 4,
        breadPerBag: 395,
        totalBreads: 1580,
        damagedBreads: 7,
        sellingPrice: 3000,
        flourPricePerBag: 280000,
        additionalExpenses: 30000 + (4 * 53000),
        calculatedRevenue: 1573 * 3000,
        calculatedCost: (4 * 280000) + 30000 + (4 * 53000),
        calculatedProfit: (1573 * 3000) - ((4 * 280000) + 30000 + (4 * 53000)),
        note: "Buyurtmalar ko'p bo'ldi, un sifati a'lo darajada."
      }
    ];
    setLogs(sampleLogs);
  };

  // Computations
  const totalBagsUsed = logs.reduce((sum, item) => sum + item.bagsUsed, 0);
  const totalBreadsBaked = logs.reduce((sum, item) => sum + item.totalBreads, 0);
  const totalNetProfit = logs.reduce((sum, item) => sum + item.calculatedProfit, 0);
  const totalDamaged = logs.reduce((sum, item) => sum + item.damagedBreads, 0);
  const avgYield = logs.length > 0 ? (logs.reduce((sum, item) => sum + item.breadPerBag, 0) / logs.length) : 0;
  const averageDamagedRate = totalBreadsBaked > 0 ? (totalDamaged / totalBreadsBaked) * 100 : 0;

  // Custom SVG Chart drawing logic (last 7 logs formatted chronologically)
  const chartData = [...logs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);

  const maxProfitInChart = chartData.length > 0 ? Math.max(...chartData.map(d => d.calculatedProfit), 100000) : 100000;
  const maxBreadsInChart = chartData.length > 0 ? Math.max(...chartData.map(d => d.totalBreads), 100) : 100;

  const isDark = theme === 'dark';

  return (
    <div className={`rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-8 border shadow-xl space-y-4 sm:space-y-8 transition-all ${
      isDark 
        ? 'bg-[#1E1916] border-[#312620] shadow-[#0f0a08]/40' 
        : 'bg-white/95 backdrop-blur-md border-amber-50 shadow-amber-950/5'
    }`}>
      
      {/* Header section with toggle add form */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 ${
        isDark ? 'border-[#312620]' : 'border-amber-50'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-[#2A211D] text-amber-400' : 'bg-amber-50/80 text-amber-600'}`}>
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Kunning Shaxsiy Daftari</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ish natijalari va daromadlarni kunbay qayd etib boring</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {logs.length > 0 && (
            showClearConfirm ? (
              <div className={`flex items-center gap-2 p-1.5 rounded-xl animate-pulse border ${
                isDark ? 'bg-rose-950/20 border-rose-800/40' : 'bg-rose-50 border-rose-200'
              }`}>
                <span className={`text-[10px] font-bold px-1 font-sans ${isDark ? 'text-rose-300' : 'text-rose-800'}`}>Aniq o'chirilsinmi?</span>
                <button
                  type="button"
                  onClick={() => {
                    setLogs([]);
                    setShowClearConfirm(false);
                  }}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  Ha, o'chirilsin
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    isDark ? 'bg-[#2A211D] text-slate-350 hover:bg-[#342924]' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  Yo'q
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="clear-all-ledger"
                onClick={() => setShowClearConfirm(true)}
                className={`px-3.5 py-2 border rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isDark 
                    ? 'border-rose-900/40 text-rose-450 bg-rose-950/20 hover:bg-rose-950/40' 
                    : 'border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100'
                }`}
              >
                Tozalash
              </button>
            )
          )}
          <button
            type="button"
            id="toggle-add-form-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer gold-glow-button ${
              isDark 
                ? 'bg-amber-600 text-white shadow-amber-950/20' 
                : 'bg-amber-500 text-[#1C1613] shadow-amber-500/10'
            }`}
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? "Yopish" : "Kiritish"}
          </button>
        </div>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total revenue / profit card */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col justify-between premium-gold-card gold-lite-glow cursor-help transition-all duration-300 ${
          isDark 
            ? 'bg-gradient-to-br from-amber-950/20 to-amber-900/5 border-amber-950/60 shadow-[#0f0a08]/40' 
            : 'bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-amber-100/30 border-amber-200/50 shadow-sm'
        }`}>
          <span className={`text-[9px] xs:text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-amber-400' : 'text-slate-500'}`}>Jami Sof Foyda</span>
          <div className="my-1.5 text-left">
            <span className={`text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-black font-sans block leading-tight break-all tracking-tight ${isDark ? 'text-amber-400' : 'text-amber-850 text-amber-800'}`}>
              {formatUZS(totalNetProfit)}
            </span>
          </div>
          <span className={`text-[9px] xs:text-[10px] font-bold flex items-center gap-0.5 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
            <TrendingUp className="w-3.5 h-3.5 shrink-0" /> Hisoblangan foyda
          </span>
        </div>

        {/* Flour Used */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col justify-between premium-gold-card gold-lite-glow cursor-help ${
          isDark ? 'bg-[#2A221E] border-[#3E322A]' : 'bg-[#FAF6F0]/60 border-amber-100'
        }`}>
          <span className={`text-[9px] xs:text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Jami Ishlatilgan Un</span>
          <div className="my-1.5 text-left">
            <span className={`text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-black font-mono block leading-tight break-all ${isDark ? 'text-slate-100 font-bold' : 'text-slate-800'}`}>
              {formatNum(totalBagsUsed)} qop
            </span>
          </div>
          <span className={`text-[9px] xs:text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-650 text-slate-600'}`}>
            Jami {formatNum(totalBagsUsed * 50)} kg un
          </span>
        </div>

        {/* Total Breads Baked */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col justify-between premium-gold-card gold-lite-glow cursor-help ${
          isDark ? 'bg-[#2A221E] border-[#3E322A]' : 'bg-[#FAF6F0]/60 border-amber-100'
        }`}>
          <span className={`text-[9px] xs:text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Jami Pishgan Non</span>
          <div className="my-1.5 text-left">
            <span className={`text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-black font-mono block leading-tight break-all ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
              {formatNum(totalBreadsBaked)} dona
            </span>
          </div>
          <span className={`text-[9px] xs:text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Yetkazilgani
          </span>
        </div>

        {/* Average yield */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col justify-between premium-gold-card gold-lite-glow cursor-help ${
          isDark ? 'bg-[#2A221E] border-[#3E322A]' : 'bg-[#FAF6F0]/60 border-amber-100'
        }`}>
          <span className={`text-[9px] xs:text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>O'rtacha chiqish (qopdan)</span>
          <div className="my-1.5 text-left">
            <span className={`text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-black font-mono block leading-tight break-all ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
              {avgYield.toFixed(0)} dona
            </span>
          </div>
          {averageDamagedRate > 0 ? (
            <span className={`text-[9px] xs:text-[10px] font-bold flex items-center gap-0.5 ${averageDamagedRate > 1.5 ? 'text-amber-500' : 'text-emerald-500'}`}>
              Zarar (singan): {averageDamagedRate.toFixed(1)}%
            </span>
          ) : (
            <span className={`text-[9px] xs:text-[10px] font-medium ${isDark ? 'text-slate-450' : 'text-slate-500'}`}>Chiqish ko'rsatkichi</span>
          )}
        </div>
      </div>

      {/* Manual Insert Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className={`border rounded-2xl p-5 space-y-4 transition-all ${
          isDark ? 'bg-[#251E1B]/80 border-[#3E322A]' : 'bg-amber-50/50 border-amber-200'
        }`}>
          <h3 className={`text-sm font-bold block ${isDark ? 'text-slate-100 font-bold' : 'text-slate-800'}`}>Kunning yakuniy natijalarini kiritish</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Date */}
            <div className="space-y-1">
              <label className={`text-xs font-bold block ${isDark ? 'text-slate-300' : 'text-slate-600'}`} htmlFor="form-date">
                Sana / Kun
              </label>
              <input
                type="date"
                id="form-date"
                required
                className={`w-full px-2.5 py-1.5 text-sm rounded-xl font-bold transition-colors outline-none focus:ring-2 focus:ring-amber-500 ${
                  isDark 
                    ? 'bg-[#1a1512] border-[#312620] text-slate-100' 
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </div>

            {/* Sacks */}
            <div className="space-y-1">
              <label className={`text-xs font-bold block ${isDark ? 'text-slate-300' : 'text-slate-600'}`} htmlFor="form-bags">
                Qop soni
              </label>
              <input
                type="number"
                id="form-bags"
                step="0.1"
                required
                min="0.1"
                className={`w-full px-2.5 py-1.5 text-sm rounded-xl font-bold font-mono transition-colors outline-none focus:ring-2 focus:ring-amber-500 ${
                  isDark 
                    ? 'bg-[#1a1512] border-[#312620] text-slate-100' 
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
                value={formBags}
                onChange={(e) => setFormBags(parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Yield per sack */}
            <div className="space-y-1">
              <label className={`text-xs font-bold block ${isDark ? 'text-slate-300' : 'text-slate-600'}`} htmlFor="form-yield">
                Non chiqishi (qorish)
              </label>
              <input
                type="number"
                id="form-yield"
                required
                min="10"
                className={`w-full px-2.5 py-1.5 text-sm rounded-xl font-bold font-mono transition-colors outline-none focus:ring-2 focus:ring-amber-500 ${
                  isDark 
                    ? 'bg-[#1a1512] border-[#312620] text-slate-100' 
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
                value={formYield}
                onChange={(e) => setFormYield(parseInt(e.target.value) || 0)}
              />
            </div>

            {/* Damaged non */}
            <div className="space-y-1">
              <label className={`text-xs font-bold block ${isDark ? 'text-slate-300' : 'text-slate-600'}`} htmlFor="form-damaged" title="Singan, pishmay qolgan yoki yongan">
                Singan/Sotilmagani
              </label>
              <input
                type="number"
                id="form-damaged"
                required
                min="0"
                className={`w-full px-2.5 py-1.5 text-sm rounded-xl font-bold font-mono transition-colors outline-none focus:ring-2 focus:ring-amber-500 ${
                  isDark 
                    ? 'bg-[#1a1512] border-[#312620] text-slate-100' 
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
                value={formDamaged}
                onChange={(e) => setFormDamaged(parseInt(e.target.value) || 0)}
              />
            </div>

            {/* Un narxi */}
            <div className="space-y-1">
              <label className={`text-xs font-bold block ${isDark ? 'text-slate-300' : 'text-slate-600'}`} htmlFor="form-flour-price" title="Flour bag purchase rate">
                Un narxi (qopga)
              </label>
              <input
                type="number"
                id="form-flour-price"
                required
                min="0"
                step="5000"
                className={`w-full px-2.5 py-1.5 text-sm rounded-xl font-bold font-mono transition-colors outline-none focus:ring-2 focus:ring-amber-500 ${
                  isDark 
                    ? 'bg-[#1a1512] border-[#312620] text-slate-100' 
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
                value={formFlourPrice}
                onChange={(e) => setFormFlourPrice(parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Selling price */}
            <div className="space-y-1">
              <label className={`text-xs font-bold block ${isDark ? 'text-slate-300' : 'text-slate-600'}`} htmlFor="form-price">
                Sotilish narxi
              </label>
              <input
                type="number"
                id="form-price"
                required
                min="0"
                step="100"
                className={`w-full px-2.5 py-1.5 text-sm rounded-xl font-bold font-mono transition-colors outline-none focus:ring-2 focus:ring-amber-500 ${
                  isDark 
                    ? 'bg-[#1a1512] border-[#312620] text-slate-100' 
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
                value={formPriceInput}
                onChange={(e) => setFormPriceInput(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3 space-y-1">
              <label className={`text-xs font-bold block ${isDark ? 'text-slate-300' : 'text-slate-600'}`} htmlFor="form-note">
                Izox / Eslatma
              </label>
              <input
                type="text"
                id="form-note"
                placeholder="Masalan: Tandir yaxshi qizidi, obi non xamiri odatdagidan mayinroq bo'ldi."
                className={`w-full px-3 py-1.5 text-sm rounded-xl font-medium transition-colors outline-none focus:ring-2 focus:ring-amber-500 ${
                  isDark 
                    ? 'bg-[#1a1512] border-[#312620] text-slate-100 placeholder-slate-500' 
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
              />
            </div>
            <div className="flex items-end pr-0">
              <button
                type="submit"
                id="submit-log"
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Daftarga qo'shish
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Visual Chart Panel */}
      {chartData.length > 0 && (
        <div className={`p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-[#251E1B]/80 border-[#3E322A]' : 'bg-slate-50/70 border border-slate-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-650 text-amber-500" />
              <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-705 text-slate-700'}`}>Kunlik Foyda va Ish Davomiyligi (Oxirgi 7 kun)</h3>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Sof Foyda (so'm)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-sky-500 rounded" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Pishgan Nonlar (dona)</span>
              </div>
            </div>
          </div>

          {/* Bespoke Interactive SVG Chart */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[500px] h-64 relative">
              <svg className="w-full h-full" viewBox="0 0 600 240">
                {/* Horizontal Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = 20 + ratio * 160;
                  return (
                    <g key={i}>
                      <line x1="40" y1={y} x2="570" y2={y} stroke={isDark ? '#3E322A' : '#E2E8F0'} strokeWidth="1" strokeDasharray="4 4" />
                      <text x="32" y={y + 3} className={`text-[9px] font-black font-mono ${isDark ? 'fill-slate-400' : 'fill-slate-500'}`} textAnchor="end">
                        {ratio === 0 ? 'Max' : ratio === 1 ? '0' : ''}
                      </text>
                    </g>
                  );
                })}

                {/* Bars Rendering */}
                {chartData.map((d, index) => {
                  const paddingLeft = 60;
                  const itemWidth = 65;
                  const x = paddingLeft + index * itemWidth;

                  // Height conversions
                  const profitHeight = Math.max(10, (d.calculatedProfit / maxProfitInChart) * 150);
                  const breadsHeight = Math.max(10, (d.totalBreads / maxBreadsInChart) * 150);

                  // Base coordinates for bottoms of bars
                  const baseY = 180;

                  // Date nicely formatted
                  const shortDate = d.date.substring(5); // MM-DD

                  return (
                    <g key={d.id} className="group cursor-help">
                      {/* Breads Baked Cylinder (Sky) */}
                      <rect
                        x={x + 5}
                        y={baseY - breadsHeight}
                        width="16"
                        height={breadsHeight}
                        fill="#0EA5E9"
                        rx="4"
                        className="opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                      {/* Breads Text tag */}
                      <text
                        x={x + 13}
                        y={baseY - breadsHeight - 4}
                        className={`text-[9px] font-black font-mono text-center opacity-0 group-hover:opacity-100 transition-opacity ${
                          isDark ? 'fill-sky-400' : 'fill-sky-805'
                        }`}
                        textAnchor="middle"
                      >
                        {formatNum(d.totalBreads)}
                      </text>

                      {/* Net Profit Cylinder (Gold/Orange) */}
                      <rect
                        x={x + 25}
                        y={baseY - profitHeight}
                        width="16"
                        height={profitHeight}
                        fill="#D97706"
                        rx="4"
                        className="opacity-85 group-hover:opacity-100 transition-opacity"
                      />
                      {/* Profit Text tag */}
                      <text
                        x={x + 33}
                        y={baseY - profitHeight - 4}
                        className={`text-[9px] font-black font-mono text-center opacity-0 group-hover:opacity-100 transition-opacity ${
                          isDark ? 'fill-amber-400' : 'fill-amber-900'
                        }`}
                        textAnchor="middle"
                      >
                        {formatNum(Math.round(d.calculatedProfit / 1000))}k
                      </text>

                      {/* Date label at bottom */}
                      <text x={x + 22} y="198" className={`text-[10px] font-black font-sans ${isDark ? 'fill-slate-300' : 'fill-slate-600'}`} textAnchor="middle">
                        {shortDate}
                      </text>
                      {/* Small Sacks indicator */}
                      <text x={x + 22} y="212" className={`text-[9px] font-mono font-black ${isDark ? 'fill-amber-400 font-bold' : 'fill-amber-801 fill-amber-800'}`} textAnchor="middle">
                        {d.bagsUsed} qop
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <p className={`text-[10px] mt-2 text-center font-bold ${isDark ? 'text-slate-550 text-slate-500' : 'text-slate-500'}`}>
              * Ustunlar ustiga qonchani olib borsangiz (hover), aniq raqamlar yuqorida ko'rinadi. Chapda: pishgan nonlar (moviy), o'ngda: o'sha kungi sof foyda (tilla rang).
            </p>
          </div>
        </div>
      )}

      {/* Ledger list table */}
      <div className="space-y-3">
        <span className={`text-xs font-black block uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-550 text-slate-500'}`}>Kunlik qatnovlar ro'yxati</span>
        
        {/* Desktop View Table: Shown only on medium screens and larger */}
        <div className={`hidden md:block overflow-x-auto rounded-2xl border transition-all ${isDark ? 'border-[#3E322A]' : 'border-slate-150'}`}>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className={`border-b text-xs font-black uppercase tracking-wider transition-colors ${
                isDark 
                  ? 'bg-[#251E1B] border-[#3E322A] text-slate-200' 
                  : 'bg-slate-50 border-slate-150 text-slate-500'
              }`}>
                <th className="px-4 py-3">Sana & Batafsil</th>
                <th className="px-4 py-3 text-center">Sotilgan (dona)</th>
                <th className="px-4 py-3 text-center">Zarar (singan)</th>
                <th className="px-4 py-3 text-right">Sof Foyda</th>
                <th className="px-4 py-3 text-center">Amal</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-all ${isDark ? 'divide-[#312620]' : 'divide-slate-150'}`}>
              {logs.map((item) => {
                const isProfit = item.calculatedProfit >= 0;
                const soldQty = item.totalBreads - item.damagedBreads;
                return (
                  <tr key={item.id} className={`group transition-colors ${
                    isDark ? 'hover:bg-[#251E1B]/50 bg-[#1e1916]/40' : 'hover:bg-slate-50/50 bg-white'
                  }`}>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className={`font-bold transition-transform group-hover:translate-x-0.5 duration-200 ${isDark ? 'text-slate-100' : 'text-slate-850 text-slate-800'}`}>
                        {item.date}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] select-none font-bold">
                        <span className={`px-1.5 py-0.25 rounded ${isDark ? 'bg-amber-950/60 text-amber-400' : 'bg-amber-50 text-amber-800'}`}>
                          ⚡ {item.bagsUsed} qop un
                        </span>
                        <span className="text-slate-400 font-mono">•</span>
                        <span className={`text-[10px] font-bold ${isDark ? 'text-slate-450' : 'text-slate-500'}`}>
                          {item.breadSales && item.breadSales.length > 0 ? "aralash narxda" : `${formatNum(item.sellingPrice)} so'mdan`}
                        </span>
                      </div>
                      {item.breadSales && item.breadSales.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1 max-w-[280px]">
                          {item.breadSales.map((sale, sIdx) => (
                            <span 
                              key={sale.id || sIdx} 
                              className={`text-[8.5px] px-1.5 py-0.5 rounded font-black tracking-tight border ${
                                isDark 
                                  ? 'bg-[#1C1613] border-amber-900/15 text-amber-300/90' 
                                  : 'bg-slate-50 border-slate-150 text-slate-600'
                              }`}
                            >
                              {sale.name || `${sIdx+1}-tur`}{sale.weight ? ` (${sale.weight}g)` : ''}: {sale.quantity} ta × {formatNum(sale.price)}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.note && (
                        <div className={`text-[10px] font-semibold italic mt-1 max-w-[220px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`} title={item.note}>
                          📝 {item.note}
                        </div>
                      )}
                    </td>
                    <td className={`px-4 py-3.5 text-center font-black font-mono text-base ${isDark ? 'text-slate-105 text-slate-100' : 'text-slate-800'}`}>
                      {formatNum(soldQty)} <span className="text-[10px] font-bold text-slate-400">dona</span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-xs">
                      {item.damagedBreads > 0 ? (
                        <div className="inline-flex flex-col items-center">
                          <span className={`font-black px-2 py-0.5 rounded-full ${
                            isDark ? 'text-rose-400 bg-rose-950/40 border border-rose-900/30' : 'text-rose-800 bg-rose-50 border border-rose-100'
                          }`}>
                            {item.damagedBreads} dona
                          </span>
                        </div>
                      ) : (
                        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>0</span>
                      )}
                    </td>
                    <td className={`px-4 py-3.5 text-right font-black font-mono text-base whitespace-nowrap`}>
                      <span className={`px-2.5 py-1 rounded-xl transition-all duration-350 ${
                        isProfit 
                          ? (isDark ? 'text-emerald-400 bg-emerald-950/30 shadow-[0_0_10px_rgba(52,211,153,0.15)] border border-emerald-500/20 font-bold' : 'text-emerald-700 bg-emerald-50 border border-emerald-100') 
                          : (isDark ? 'text-rose-400 bg-rose-950/30 border border-rose-900/20' : 'text-rose-601 text-rose-650 bg-rose-50 border border-rose-100')
                      }`}>
                        {formatUZS(item.calculatedProfit)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {deleteConfirmId === item.id ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setLogs(logs.filter(it => it.id !== item.id));
                              setDeleteConfirmId(null);
                            }}
                            className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer whitespace-nowrap shadow-sm shadow-rose-900/10 hover:scale-[1.04]"
                          >
                            Ha, o'chir
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className={`px-2 py-1.5 font-bold rounded-lg text-[10px] transition-all cursor-pointer whitespace-nowrap ${
                              isDark ? 'bg-[#2A221E] text-slate-300 hover:bg-[#342924]' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                            }`}
                          >
                            Yo'q
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          id={`delete-log-row-${item.id}`}
                          onClick={() => setDeleteConfirmId(item.id)}
                          className={`p-1.5 px-3 border rounded-xl transition-all duration-200 scale-100 hover:scale-[1.05] hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] cursor-pointer text-xs font-bold whitespace-nowrap ${
                            isDark 
                              ? 'text-rose-400 hover:text-rose-300 bg-rose-950/20 border-rose-900/20 hover:bg-rose-950/40' 
                              : 'text-slate-500 hover:text-rose-650 bg-white hover:bg-rose-50 border-slate-200 hover:border-rose-100'
                          }`}
                        >
                          O'chirish
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center space-y-3.5 text-slate-400">
                      <AlertTriangle className="w-8 h-8 text-amber-500/80" />
                      <div className={`text-xs font-bold max-w-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Daftaringiz bo'sh. O'zingiz kiritishingiz yoki tushunarli bo'lishi uchun oldingi kunlik namuna ma'lumotlarini yuklashingiz mumkin.
                      </div>
                      <button
                        type="button"
                        id="load-sample-btn"
                        onClick={handleLoadSampleData}
                        className={`px-3 py-1.5 border text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          isDark 
                            ? 'bg-amber-950/20 border-amber-900/30 text-amber-400 hover:bg-amber-950/40' 
                            : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        Namuna yuklash
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Card List: Optimized explicitly for smartphones */}
        <div className="block md:hidden space-y-4 animate-fade-in">
          {logs.map((item) => {
            const isProfit = item.calculatedProfit >= 0;
            const soldQty = item.totalBreads - item.damagedBreads;
            return (
              <div 
                key={item.id} 
                className={`p-4 rounded-2xl border flex flex-col gap-3 shadow-sm transition-all ${
                  isDark 
                    ? 'bg-[#251E1B]/80 border-[#3E322A]' 
                    : 'bg-slate-50/70 border-slate-150'
                }`}
              >
                {/* Mobile Card Row 1: Date and Sacks */}
                <div className="flex items-center justify-between pb-2 border-b border-dashed border-[#3E322A]/20">
                  <div className="flex flex-col text-left">
                    <span className={`text-xs font-black font-mono ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                      📅 {item.date}
                    </span>
                    <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
                      ⚡ {item.bagsUsed} qop un (1 qopdan ~{item.breadPerBag} ta)
                    </span>
                  </div>

                  {/* Delete Trigger on mobile */}
                  <div className="shrink-0">
                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1 bg-rose-500/10 p-1 rounded-lg border border-rose-500/10">
                        <button
                          type="button"
                          onClick={() => {
                            setLogs(logs.filter(it => it.id !== item.id));
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg text-[9px] uppercase cursor-pointer"
                        >
                          O'chirish
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className={`px-2 py-1 font-bold rounded-lg text-[9px] uppercase cursor-pointer ${
                            isDark ? 'bg-[#1C1613] text-slate-300' : 'bg-white text-slate-700'
                          }`}
                        >
                          Yo'q
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(item.id)}
                        className={`p-1.5 px-3 border rounded-xl font-bold transition-all duration-200 text-[10px] whitespace-nowrap cursor-pointer ${
                          isDark 
                            ? 'text-rose-405 bg-rose-950/20 border-rose-900/20 hover:bg-rose-950/40' 
                            : 'text-slate-500 bg-white hover:bg-rose-50 border-slate-200'
                        }`}
                      >
                        O'chirish
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile Card Row 2: Quantities indicators with labels */}
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className={`p-2 rounded-xl border ${isDark ? 'bg-[#1C1613]/55 border-[#3E322A]/50' : 'bg-white border-slate-200'}`}>
                    <span className={`text-[8.5px] font-extrabold uppercase tracking-wide block leading-none mb-1 text-slate-405 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sotilgan non</span>
                    <span className={`font-black font-mono text-sm sm:text-base block ${isDark ? 'text-emerald-400' : 'text-slate-800'}`}>
                      {formatNum(soldQty)} <span className="text-[10px] font-bold text-slate-400">dona</span>
                    </span>
                  </div>

                  <div className={`p-2 rounded-xl border ${isDark ? 'bg-[#1C1613]/55 border-[#3E322A]/50' : 'bg-white border-slate-200'}`}>
                    <span className={`text-[8.5px] font-extrabold uppercase tracking-wide block leading-none mb-1 text-slate-405 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Zarar (singan)</span>
                    <span className={`font-black font-mono text-sm sm:text-base block ${item.damagedBreads > 0 ? 'text-rose-455 text-rose-400' : 'text-slate-400'}`}>
                      {item.damagedBreads} <span className="text-[10px] font-bold text-slate-400">dona</span>
                    </span>
                  </div>
                </div>

                {/* Mobile Card Row 3: Financial summaries - spacious layout */}
                <div className={`p-3 rounded-xl border flex items-center justify-between text-left ${
                  isProfit 
                    ? (isDark ? 'bg-emerald-950/30 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100')
                    : (isDark ? 'bg-[#31110e]/20 border-rose-900/30' : 'bg-rose-50 border-rose-100')
                }`}>
                  <div>
                    <span className={`text-[8px] font-bold uppercase block tracking-wider leading-none mb-1 ${
                      isProfit 
                        ? (isDark ? 'text-emerald-405 text-emerald-400' : 'text-emerald-800') 
                        : (isDark ? 'text-rose-405' : 'text-rose-800')
                    }`}>
                      {isProfit ? '💵 Kunlik Sof Foyda' : '📉 Kunlik Zarar'}
                    </span>
                    <span className={`text-base font-black font-mono select-all tracking-tight ${
                      isProfit 
                        ? (isDark ? 'text-emerald-400' : 'text-emerald-700 bg-emerald-50') 
                        : (isDark ? 'text-rose-400' : 'text-rose-700')
                    }`}>
                      {formatUZS(item.calculatedProfit)}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <span className={`text-[8px] font-semibold text-slate-400 block leading-none mb-1`}>Tarif / Narxi</span>
                    <span className={`text-[10px] font-bold ${isDark ? 'text-slate-350 text-slate-300' : 'text-slate-700'}`}>
                      {item.breadSales && item.breadSales.length > 0 ? "Aralash narxda" : `${formatNum(item.sellingPrice)} so'mdan`}
                    </span>
                  </div>
                </div>

                {/* Bread type tags if multi-prices were used */}
                {item.breadSales && item.breadSales.length > 0 && (
                  <div className="space-y-1 py-0.5 text-left">
                    <span className="text-[8.5px] font-extrabold text-slate-400 block uppercase tracking-wide">Sotilgan non turlari:</span>
                    <div className="flex flex-wrap gap-1 max-w-full">
                      {item.breadSales.map((sale, sIdx) => (
                        <span 
                          key={sale.id || sIdx} 
                          className={`text-[8.5px] px-2 py-0.5 rounded font-black tracking-tight border ${
                            isDark 
                              ? 'bg-[#1C1613] border-[#3E322A] text-amber-300/90' 
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          {sale.name || `${sIdx+1}-tur`}{sale.weight ? ` (${sale.weight}g)` : ''}: {sale.quantity} ta × {formatNum(sale.price)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional description notes on mobile */}
                {item.note && (
                  <div className={`text-[10px] leading-relaxed italic p-2 border border-dashed rounded-xl font-medium text-left ${
                    isDark 
                      ? 'bg-[#1C1613]/40 border-amber-900/10 text-slate-400' 
                      : 'bg-white border-amber-200/50 text-slate-500'
                  }`}>
                    📝 {item.note}
                  </div>
                )}

              </div>
            );
          })}

          {logs.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50 dark:bg-[#251E1B]/55 rounded-2xl border border-dashed border-[#3E322A]/20">
              <AlertTriangle className="w-8 h-8 text-amber-500/80 mb-2" />
              <div className={`text-xs font-bold max-w-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                Daftaringiz bo'sh. O'zingiz kiritishingiz yoki tushunish oson bo'lishi uchun oldingi kunlik namuna statistikani yuklang.
              </div>
              <button
                type="button"
                id="load-sample-btn-mobile"
                onClick={handleLoadSampleData}
                className={`px-3 py-1.5 border text-xs font-bold rounded-xl transition-all cursor-pointer mt-3.5 ${
                  isDark 
                    ? 'bg-amber-950/20 border-amber-900/30 text-amber-400' 
                    : 'bg-white border-slate-200 text-slate-650'
                }`}
              >
                Namuna yuklash
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
