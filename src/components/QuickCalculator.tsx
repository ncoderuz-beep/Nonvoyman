/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingBag, Coins, TrendingUp, Sparkles, DollarSign, Calculator, ChevronRight, AlertCircle, ArrowRight } from 'lucide-react';
import { formatUZS, formatNum } from '../data';

interface QuickCalculatorProps {
  bagsCount: number;
  setBagsCount: (val: number) => void;
  breadPerBag: number;
  setBreadPerBag: (val: number) => void;
  flourPrice: number;
  setFlourPrice: (val: number) => void;
  sellingPrice: number;
  setSellingPrice: (val: number) => void;
  unitExpensesPerBag: number;
  fixedExpensesDaily: number;
  onSaveLog: () => void;
}

export default function QuickCalculator({
  bagsCount,
  setBagsCount,
  breadPerBag,
  setBreadPerBag,
  flourPrice,
  setFlourPrice,
  sellingPrice,
  setSellingPrice,
  unitExpensesPerBag,
  fixedExpensesDaily,
  onSaveLog
}: QuickCalculatorProps) {

  // Intermediate helper states for preset value selectors to make clicking rapid
  const bagPresets = [1, 2, 3, 5, 10, 15, 20];
  const yieldPresets = [220, 300, 350, 395, 420];
  const pricePresets = [2500, 3000, 3500, 4000, 5000];

  const totalBread = bagsCount * breadPerBag;
  const totalFlourWeight = bagsCount * 50; // assuming standard 50kg bag

  // Cost calculations
  const totalFlourCost = bagsCount * flourPrice;
  const totalVariableCost = bagsCount * unitExpensesPerBag;
  const totalCost = totalFlourCost + totalVariableCost + fixedExpensesDaily;

  // Earnings
  const totalRevenue = totalBread * sellingPrice;
  const netProfit = totalRevenue - totalCost;
  const costPerBread = totalBread > 0 ? totalCost / totalBread : 0;
  const marginPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-amber-100 shadow-xl shadow-amber-900/5 focus-within:border-amber-300 transition-all" id="quick-calc-section">
      <div className="flex items-center justify-between mb-6 border-b border-amber-50 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Kalkulyator</h2>
            <p className="text-xs text-slate-500">Un, non va foyda nisbatini lahzada hisoblang</p>
          </div>
        </div>
        <div className="bg-amber-100/50 text-amber-800 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Standard qop: 50 kg
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* INPUTS COLUMN */}
        <div className="space-y-6">
          {/* Sacks count control */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-700 font-sans" htmlFor="bags-range">
                Qop un miqdori (kuniga)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0.5"
                  max="100"
                  step="0.5"
                  id="bags-input"
                  className="w-20 px-2 py-1 text-center font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={bagsCount}
                  onChange={(e) => setBagsCount(Math.max(0.1, parseFloat(e.target.value) || 0))}
                />
                <span className="text-xs font-semibold text-slate-500">qop</span>
              </div>
            </div>

            <input
              type="range"
              min="0.5"
              max="30"
              step="0.5"
              id="bags-range"
              value={bagsCount}
              onChange={(e) => setBagsCount(parseFloat(e.target.value))}
              className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              {bagPresets.map((num) => (
                <button
                  key={num}
                  id={`preset-bag-${num}`}
                  type="button"
                  onClick={() => setBagsCount(num)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    bagsCount === num
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 scale-105'
                      : 'bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border border-slate-100'
                  }`}
                >
                  {num} qop
                </button>
              ))}
            </div>
          </div>

          {/* Sacks visual graphic */}
          <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100">
            <div className="text-xs font-medium text-slate-500 mb-2.5 flex items-center justify-between">
              <span>Un sarfi tasviri:</span>
              <span className="font-mono text-slate-600 font-semibold">{totalFlourWeight} kg un</span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
              {Array.from({ length: Math.min(30, Math.ceil(bagsCount)) }).map((_, i) => (
                <div
                  key={i}
                  className="relative group flex flex-col items-center bg-white p-1.5 rounded-xl border border-amber-100 shadow-sm hover:border-amber-300 transition-transform hover:-translate-y-0.5 cursor-help"
                  title={`${i + 1}-qop un`}
                >
                  <svg className="w-8 h-8 text-amber-700/80" fill="currentColor" viewBox="0 0 24 24">
                    {/* Flour bag icon representation */}
                    <path d="M19,3H5C3.9,3,3,3.9,3,5V19C3,20.1,3.9,21,5,21H19C20.1,21,21,20.1,21,19H21C21,19 21,19 21,19V5C21,3.9,20.1,3,19,3Z" fill="#FDF6E2" stroke="#B45309" strokeWidth="1.5" />
                    <path d="M5,6L12,12L19,6" stroke="#B45309" strokeWidth="1.5" />
                    <text x="12" y="18" fill="#B45309" fontSize="6px" fontWeight="bold" textAnchor="middle">50 kg</text>
                  </svg>
                  <span className="text-[9px] font-bold text-amber-800 mt-1">#{i + 1}</span>
                </div>
              ))}
              {bagsCount > 30 && (
                <div className="flex items-center justify-center px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
                  + {Math.floor(bagsCount - 30)} qop
                </div>
              )}
            </div>
          </div>

          {/* Loaves per bag */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-700 font-sans" htmlFor="yield-range">
                1 qop undan chiqadigan non soni
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="1000"
                  id="yield-input"
                  className="w-16 px-2 py-1 text-center font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={breadPerBag}
                  onChange={(e) => setBreadPerBag(Math.max(1, parseInt(e.target.value) || 0))}
                />
                <span className="text-xs font-semibold text-slate-500">dona</span>
              </div>
            </div>

            <input
              type="range"
              min="100"
              max="600"
              step="5"
              id="yield-range"
              value={breadPerBag}
              onChange={(e) => setBreadPerBag(parseInt(e.target.value))}
              className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              {yieldPresets.map((num) => (
                <button
                  key={num}
                  id={`preset-yield-${num}`}
                  type="button"
                  onClick={() => setBreadPerBag(num)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    breadPerBag === num
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 scale-105'
                      : 'bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border border-slate-100'
                  }`}
                >
                  {num} {num === 395 ? '⭐ Standart' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Flour Price per Sack */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block" htmlFor="flour-price-input">
                1 qop un narxi
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="5000"
                  min="0"
                  id="flour-price-input"
                  className="w-full pl-3 pr-10 py-2.5 font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-sm"
                  value={flourPrice}
                  onChange={(e) => setFlourPrice(parseFloat(e.target.value) || 0)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 bg-slate-200/60 px-1 py-0.5 rounded">so'm</span>
              </div>
            </div>

            {/* Selling Price per Bread */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block" htmlFor="selling-price-input">
                Nonning sotilish narxi
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="100"
                  min="0"
                  id="selling-price-input"
                  className="w-full pl-3 pr-10 py-2.5 font-bold text-amber-700 bg-amber-50/40 border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-sm"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-600 bg-amber-100/50 px-1 py-0.5 rounded">so'm</span>
              </div>
            </div>
          </div>

          {/* Pricing quick select items */}
          <div className="space-y-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 block">Sotilish narxi shablonlari:</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {pricePresets.map((num) => (
                <button
                  key={num}
                  id={`preset-price-${num}`}
                  type="button"
                  onClick={() => setSellingPrice(num)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                    sellingPrice === num
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {formatNum(num)} so'm
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* OUTPUTS COLUMN */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 relative overflow-hidden shadow-2xl border border-slate-750">
            {/* Background glowing decorations */}
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-amber-500/10 blur-2xl" />
            <div className="absolute -left-10 -top-10 w-32 h-32 rounded-full bg-amber-500/5 blur-xl" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 tracking-wider uppercase font-mono">Hisobot natijalari</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  Kunlik ko'rsatkich
                </span>
              </div>

              {/* Main Total Loaves display */}
              <div className="border-b border-white/5 pb-4">
                <span className="text-xs text-slate-400 block mb-1">Jami pishiriladigan nonlar soni:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-amber-500 tracking-tight font-sans">
                    {formatNum(totalBread)}
                  </span>
                  <span className="text-lg font-bold text-amber-300">dona non</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    1 qopdan <span className="text-white font-medium">{breadPerBag}</span> dona non x {bagsCount} qop
                  </span>
                </div>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-3 text-sm">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Jami Daromad:</span>
                  <span className="font-extrabold text-white text-base">
                    {formatUZS(totalRevenue)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Sof Foyda:</span>
                  <span className={`font-extrabold text-base ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatUZS(netProfit)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Un xarajati:</span>
                  <span className="font-bold text-slate-300 text-xs">
                    {formatUZS(totalFlourCost)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Boshqa xarajatlar:</span>
                  <span className="font-bold text-slate-300 text-xs" title="Yoqilg'i, ishchi kuchi va xoretslar">
                    {formatUZS(totalVariableCost + fixedExpensesDaily)}
                  </span>
                </div>
              </div>

              {/* Health status details */}
              <div className="bg-slate-800/80 border border-white/5 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Pishiriladigan un miqdori:</span>
                  <span className="font-mono text-white font-bold">{totalFlourWeight} kg</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">1 dona nonning tannarxi:</span>
                  <span className="font-mono text-amber-400 font-bold">{formatUZS(costPerBread)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Foyda rentabelligi:</span>
                  <span className={`font-mono font-bold ${marginPercentage > 30 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {marginPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action to log the day */}
          <div className="bg-amber-50 border border-amber-200/55 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="text-xs text-amber-900/80 text-center sm:text-left">
              <span className="font-bold block">Ushbu natijani daftarizga saqlaysizmi?</span>
              Bugungi nonvoylik kunlik natijasini shaxsiy jurnalingizda doimiy saqlab boring.
            </div>
            <button
              type="button"
              id="save-log-btn"
              onClick={onSaveLog}
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-600/10 hover:shadow-amber-600/25 transition-all flex items-center justify-center gap-1.5 text-xs whitespace-nowrap cursor-pointer hover:scale-[1.02]"
            >
              Daftarga yozib qo'yish
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
