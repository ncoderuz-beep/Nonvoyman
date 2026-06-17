/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BreadSaleItem {
  id: string;
  price: number;
  quantity: number;
  name?: string;
  weight?: number; // non og'irligi (grammda)
}

export interface DailyLog {
  id: string;
  date: string;
  bagsUsed: number;
  breadPerBag: number;
  totalBreads: number;
  damagedBreads: number;
  sellingPrice: number; // can be average or default
  flourPricePerBag: number;
  additionalExpenses: number; // Gas, charcoal, wood, electricity, salaries, helper costs
  calculatedRevenue: number;
  calculatedCost: number;
  calculatedProfit: number;
  note?: string;
  breadSales?: BreadSaleItem[]; // Detailed sales breakdown
}

export interface RecipePreset {
  id: string;
  name: string;
  description: string;
  hydration: number; // e.g. 58 for 58% relative to flour weight
  salt: number;      // e.g. 1.8%
  yeast: number;     // e.g. 1.0%
  fat: number;       // e.g. 0.0% (for patir, it might contain milk/butter)
  averageYield: number; // normal bread yield per 50kg bag
}

export interface CustomExpense {
  id: string;
  name: string;
  amount: number;
  type: 'fixed' | 'per_bag';
}

export interface SalaryRecord {
  id: string;
  workerName: string;
  amount: number;
  date: string;
  period?: 'kunlik' | 'haftalik' | 'oylik';
  note?: string;
}

