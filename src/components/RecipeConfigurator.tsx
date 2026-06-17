/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, CupSoda, Percent, Flame, Wheat, Settings, HelpCircle, Check } from 'lucide-react';
import { RECIPE_PRESETS } from '../data';
import { RecipePreset } from '../types';

interface RecipeConfiguratorProps {
  bagsCount: number;
  breadPerBag: number;
  onPresetSelect: (preset: RecipePreset) => void;
}

export default function RecipeConfigurator({
  bagsCount,
  breadPerBag,
  onPresetSelect
}: RecipeConfiguratorProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('obi-non');
  
  // Custom formula variables (initially filled from selected preset)
  const [hydration, setHydration] = useState<number>(58); // %
  const [salt, setSalt] = useState<number>(1.8);       // %
  const [yeast, setYeast] = useState<number>(1.0);     // %
  const [fat, setFat] = useState<number>(0.0);         // %

  const currentPreset = RECIPE_PRESETS.find(p => p.id === selectedPresetId) || RECIPE_PRESETS[0];

  // Update slider variables when preset selection changes
  useEffect(() => {
    setHydration(currentPreset.hydration);
    setSalt(currentPreset.salt);
    setYeast(currentPreset.yeast);
    setFat(currentPreset.fat);
  }, [selectedPresetId]);

  // Handle clicking a preset
  const handleSelectPreset = (preset: RecipePreset) => {
    setSelectedPresetId(preset.id);
    onPresetSelect(preset);
  };

  // Calculations based on current multipliers relative to flour weight
  const totalFlourKg = bagsCount * 50; // standard 50 kg per bag

  const waterLiters = (totalFlourKg * hydration) / 100;
  const saltKg = (totalFlourKg * salt) / 100;
  const yeastKg = (totalFlourKg * yeast) / 100;
  const fatKg = (totalFlourKg * fat) / 100;

  // Total Dough Weight = Flour + Water + Salt + Yeast + Fat
  const totalDoughKg = totalFlourKg + waterLiters + saltKg + yeastKg + fatKg;

  // Total expected bread (loaves)
  const totalLoaves = Math.ceil(bagsCount * breadPerBag);

  // Dough weight per bread in grams
  const doughWeightPerBreadG = totalLoaves > 0 ? (totalDoughKg * 1000) / totalLoaves : 0;

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-amber-100 shadow-xl shadow-amber-900/5 transition-all" id="recipe-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-amber-50 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
            <Wheat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Xamir Sirlari & Retseptlar</h2>
            <p className="text-xs text-slate-500">Non turlari bo'yicha masalliqlar nisbati va zuvala og'irligi</p>
          </div>
        </div>
      </div>

      {/* Bread preset choices */}
      <div className="mb-6">
        <span className="text-xs font-bold text-slate-500 block mb-3 uppercase tracking-wider">Non turini tanlang:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {RECIPE_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                id={`recipe-preset-${preset.id}`}
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-4 rounded-2xl transition-all border outline-none ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-300 shadow-md ring-2 ring-amber-500/10'
                    : 'bg-white hover:bg-slate-50 border-slate-150 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-bold ${isSelected ? 'text-amber-800' : 'text-slate-800'}`}>
                    {preset.name}
                  </span>
                  {isSelected && (
                    <span className="p-1 rounded-full bg-amber-600 text-white shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2.5">
                  {preset.description}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-auto pt-1 border-t border-dashed border-slate-100">
                  <span title="Hydration">Suv: {preset.hydration}%</span>
                  <span title="Output per bag">Chiqishi: ~{preset.averageYield}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Custom Recipe Sliders */}
        <div className="lg:col-span-5 bg-slate-50/70 border border-slate-100 rounded-2xl p-5 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Retsept formulasini sozlash</h3>
          </div>

          {/* Hydration Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Suv nisbati (Namlik):</span>
              <span className="text-amber-700 font-bold font-mono">{hydration}%</span>
            </div>
            <input
              type="range"
              min="35"
              max="75"
              step="1"
              id="hydration-range"
              value={hydration}
              onChange={(e) => setHydration(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <span className="text-[10px] text-slate-400 block leading-tight">
              100 kg unga solinadigan suv og'irligi (litr hisobida).
            </span>
          </div>

          {/* Salt Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Tuz miqdori:</span>
              <span className="text-amber-700 font-bold font-mono">{salt}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              id="salt-range"
              value={salt}
              onChange={(e) => setSalt(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>

          {/* Yeast Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Drojji (Achitqi):</span>
              <span className="text-amber-700 font-bold font-mono">{yeast}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2.5"
              step="0.1"
              id="yeast-range"
              value={yeast}
              onChange={(e) => setYeast(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>

          {/* Fat Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Sut, Yog' yoki Margarin:</span>
              <span className="text-amber-700 font-bold font-mono">{fat}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="0.5"
              id="fat-range"
              value={fat}
              onChange={(e) => setFat(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>
        </div>

        {/* Dynamic Mixing Sheet Display */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-gradient-to-br from-amber-500/5 to-amber-600/5 border border-amber-200/50 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-amber-900 mb-3 block">
              Qorish jadvali ({bagsCount} qop un uchun)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Flour */}
              <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-sm flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                  <Wheat className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Un miqdori</span>
                  <span className="font-extrabold text-slate-800 font-mono">{totalFlourKg.toFixed(1)} kg</span>
                </div>
              </div>

              {/* Water */}
              <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-sm flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <CupSoda className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Suv</span>
                  <span className="font-extrabold text-slate-800 font-mono text-blue-700">{waterLiters.toFixed(1)} Litr</span>
                </div>
              </div>

              {/* Salt */}
              <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-sm flex items-center gap-3">
                <div className="p-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm leading-none flex items-center justify-center w-9 h-9">
                  NaCl
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Tuz</span>
                  <span className="font-extrabold text-slate-800 font-mono">
                    {saltKg >= 1 ? `${saltKg.toFixed(2)} kg` : `${(saltKg * 1000).toFixed(0)} gramm`}
                  </span>
                </div>
              </div>

              {/* Yeast */}
              <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-sm flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Drojji / Achitqi</span>
                  <span className="font-extrabold text-slate-800 font-mono">
                    {yeastKg >= 1 ? `${yeastKg.toFixed(2)} kg` : `${(yeastKg * 1000).toFixed(0)} gramm`}
                  </span>
                </div>
              </div>

              {/* Rich fat if active */}
              {fat > 0 && (
                <div className="bg-white p-3.5 rounded-xl border border-amber-100 col-span-1 sm:col-span-2 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Yog' / Margarin / Sut hammasi qo'shilgan holda</span>
                    <span className="font-extrabold text-yellow-700 font-mono">{fatKg.toFixed(2)} kg</span>
                  </div>
                </div>
              )}
            </div>

            {/* Total mass box */}
            <div className="mt-4 border-t border-dashed border-amber-200/60 pt-3 flex justify-between items-center text-xs">
              <span className="text-slate-600 font-semibold">Umumiy xamir og'irligi:</span>
              <span className="font-extrabold text-amber-800 font-mono text-sm bg-amber-100/55 px-2.5 py-0.5 rounded-lg border border-amber-200">
                {totalDoughKg.toFixed(1)} kg xamir
              </span>
            </div>
          </div>

          {/* Bread Weight Gauge Box */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 flex items-center justify-between border border-slate-800 shadow-md">
            <div>
              <span className="text-[10px] text-amber-400 block font-semibold uppercase tracking-wider">Tavsiya qilinadigan zuvala</span>
              <span className="text-xs text-slate-400 leading-tight">
                1 dona non uchun mo'ljallangan xamir bo'lagi (oyiladorlik hisobi):
              </span>
            </div>
            <div className="text-right pl-3">
              <span className="text-3xl font-black text-white font-mono block">
                {doughWeightPerBreadG.toFixed(0)}
              </span>
              <span className="text-[10px] text-amber-500 font-bold font-mono">gramm / dona</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
