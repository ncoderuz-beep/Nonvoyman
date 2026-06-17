/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash2, ShieldCheck, Fuel, Users, Landmark, Hammer, DollarSign, Wallet } from 'lucide-react';
import { CustomExpense } from '../types';
import { formatUZS } from '../data';

interface ExpenseManagerProps {
  expenses: CustomExpense[];
  setExpenses: (val: CustomExpense[]) => void;
  bagsCount: number;
}

export default function ExpenseManager({
  expenses,
  setExpenses,
  bagsCount
}: ExpenseManagerProps) {
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState<number | ''>('');
  const [newExpenseType, setNewExpenseType] = useState<'fixed' | 'per_bag'>('per_bag');
  const [deleteExpenseConfirmId, setDeleteExpenseConfirmId] = useState<string | null>(null);

  // Handle adding custom item
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseName.trim() || !newExpenseAmount) return;

    const newExpense: CustomExpense = {
      id: Date.now().toString(),
      name: newExpenseName.trim(),
      amount: Number(newExpenseAmount),
      type: newExpenseType
    };

    setExpenses([...expenses, newExpense]);
    setNewExpenseName('');
    setNewExpenseAmount('');
  };

  // Handle deleting item
  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(item => item.id !== id));
  };

  // Change amount on-the-fly inside the list
  const handleChangeAmount = (id: string, value: number) => {
    setExpenses(
      expenses.map(item => (item.id === id ? { ...item, amount: value } : item))
    );
  };

  // Calculate Subtotals
  const fixedTotal = expenses
    .filter(e => e.type === 'fixed')
    .reduce((sum, e) => sum + e.amount, 0);

  const variablesPerBagTotal = expenses
    .filter(e => e.type === 'per_bag')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCalculatedExpenses = fixedTotal + (variablesPerBagTotal * bagsCount);

  // Pick helpful icon indicator based on expense name keywords
  const getExpenseIcon = (name: string) => {
    const lowercase = name.toLowerCase();
    if (lowercase.includes('tandir') || lowercase.includes('o\'tin') || lowercase.includes('gaz') || lowercase.includes('fuel')) {
      return <Fuel className="w-4 h-4 text-orange-500" />;
    }
    if (lowercase.includes('ishch') || lowercase.includes('bosh') || lowercase.includes('xizmat') || lowercase.includes('oylik') || lowercase.includes('staff')) {
      return <Users className="w-4 h-4 text-blue-500" />;
    }
    if (lowercase.includes('irar') || lowercase.includes('bino') || lowercase.includes('rent')) {
      return <Landmark className="w-4 h-4 text-indigo-500" />;
    }
    return <Wallet className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-xl shadow-slate-900/5 transition-all" id="expenses-section">
      <div className="flex items-center gap-3 mb-6 border-b border-amber-50 pb-5">
        <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Xarajatlar & Soliqlar burchagi</h2>
          <p className="text-xs text-slate-500">Un narxidan tashqari barcha yashirin yoqilg'i va ish haqi xarajatlari</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left side: List of expenses with on-the-fly editing */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Xarajat turi nomi</span>
            <span>Qiymati (so'm)</span>
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-xl hover:border-slate-300 hover:bg-white transition-all group"
              >
                <div className="flex items-center gap-3 w-1/2">
                  <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-sm shrink-0">
                    {getExpenseIcon(expense.name)}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-700 leading-tight block">{expense.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {expense.type === 'fixed' ? 'Kunlik o\'zgarmas' : `1 qop un uchun xarajat`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-1/2 justify-end">
                  <div className="relative max-w-[140px] w-full">
                    <input
                      type="number"
                      step="1000"
                      min="0"
                      className="w-full text-right font-mono font-bold text-slate-700 bg-white border border-slate-200 rounded-lg py-1 pl-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                      value={expense.amount}
                      onChange={(e) => handleChangeAmount(expense.id, Math.max(0, parseInt(e.target.value) || 0))}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">so'm</span>
                  </div>

                  {deleteExpenseConfirmId === expense.id ? (
                    <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-xl animate-pulse">
                      <button
                        type="button"
                        onClick={() => {
                          handleDeleteExpense(expense.id);
                          setDeleteExpenseConfirmId(null);
                        }}
                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[9px] cursor-pointer"
                      >
                        Ha
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteExpenseConfirmId(null)}
                        className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-[9px] cursor-pointer"
                      >
                        Yo'q
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      title="Xarajatni o'chirish"
                      id={`delete-expense-${expense.id}`}
                      onClick={() => setDeleteExpenseConfirmId(expense.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {expenses.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl">
                Hozircha qo'shimcha xarajatlar kiritilmagan.
              </div>
            )}
          </div>

          {/* Expense Aggregations and summary card */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10.5px] text-amber-400 font-bold uppercase tracking-wider block">Jami yo'ldosh xarajatlar</span>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Un narxidan tashqari barcha yoqilg'i, ijara, suv, drajji va mehnat pullarining {bagsCount} qop un uchun jami yig'indisi.
              </p>
            </div>
            <div className="text-right sm:border-l sm:border-slate-800 sm:pl-5 shrink-0 flex flex-col justify-center">
              <span className="text-xl font-extrabold text-white font-mono">{formatUZS(totalCalculatedExpenses)}</span>
              <span className="text-[10px] text-slate-400 font-medium">Bozor unidan alohida xarajat</span>
            </div>
          </div>
        </div>

        {/* Right side: Add custom expense form */}
        <div className="lg:col-span-5 bg-amber-50/40 border border-amber-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Plus className="w-4 h-4 text-amber-700" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Yangi xarajat qo'shish</h3>
          </div>

          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block" htmlFor="exp-name">
                Xarajat nomi / turi
              </label>
              <input
                type="text"
                id="exp-name"
                placeholder="Masalan: Yordamchi oyligi, Tuz, Sedana pichogi"
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block" htmlFor="exp-amount">
                  Qiymati (so'm)
                </label>
                <input
                  type="number"
                  id="exp-amount"
                  placeholder="30000"
                  required
                  min="0"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono font-bold"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block" htmlFor="exp-type">
                  Xarajat hisoblanishi
                </label>
                <select
                  id="exp-type"
                  className="w-full px-2.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-slate-700"
                  value={newExpenseType}
                  onChange={(e) => setNewExpenseType(e.target.value as 'fixed' | 'per_bag')}
                >
                  <option value="per_bag">Har bir qopga</option>
                  <option value="fixed">Har kun o'zgarmas</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              id="add-expense-btn"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Ro'yxatga qo'shish
            </button>
          </form>

          <div className="border-t border-amber-200/50 pt-2.5 flex items-start gap-2.5 text-[11px] text-amber-900/60 leading-normal">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Maslahat:</strong> Agar ishchilaringizga har bir pishirgan noni uchun haq bersangiz, bitta qopga pishgan non sonini o'rtacha hisoblangan oylikka ko'paytirib kiriting (masalan: 395 non x 400 so'm = 158 000 so'm).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
