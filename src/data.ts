/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RecipePreset, CustomExpense } from './types';

export const RECIPE_PRESETS: RecipePreset[] = [
  {
    id: 'obi-non',
    name: 'Obi Non (Oddiy xamir)',
    description: 'Kundalik tandir noni. Kam xarajatli, qarsildoq va xushta\'m.',
    hydration: 58,    // 58% water relative to flour weight
    salt: 1.8,       // 1.8% salt
    yeast: 1.0,      // 1% dry yeast
    fat: 0.0,        // No additional fat
    averageYield: 395 // Exactly matching user's yield per bag parameter!
  },
  {
    id: 'tandir-patir',
    name: 'Tandir Patir (Yog\'li)',
    description: 'Sut, margarin yoki sariyog\' qo\'shilgan og\'ir va to\'yimli qatlama patir.',
    hydration: 45,    // 45% water
    salt: 1.6,       // 1.6% salt
    yeast: 0.8,      // 0.8% yeast
    fat: 16.0,       // 16% fat fraction
    averageYield: 220
  },
  {
    id: 'gijda',
    name: 'Gijda Non (Yumshoq)',
    description: 'Oshirilgan, chetlari qalin va o\'rtasi yumshoq dorivor non.',
    hydration: 62,    // High hydration for puffy structure
    salt: 2.0,       // 2% salt
    yeast: 1.5,      // 1.5% yeast
    fat: 2.0,        // 2% oil
    averageYield: 300
  },
  {
    id: 'shirmoy',
    name: 'Shirmoy Non (An\'anaviy)',
    description: 'Noxat va arpabodiyon damlamasida tayyorlanadigan eng qadimiy non turi.',
    hydration: 55,    // 55% water
    salt: 1.5,       // 1.5% salt
    yeast: 1.2,      // 1.2% yeast
    fat: 6.0,        // 6% milk/fat
    averageYield: 340
  }
];

export const INITIAL_EXPENSES: CustomExpense[] = [
  { id: '1', name: 'Tandir yoqilg\'isi (O\'tin, Ko\'mir yoki Gaz)', amount: 45000, type: 'per_bag' },
  { id: '2', name: 'Drojji va tuz xarajatlari', amount: 8000, type: 'per_bag' },
  { id: '3', name: 'Ishchilar ulushi (bitta non uchun)', amount: 400, type: 'per_bag' }, // can compute dynamically
  { id: '4', name: 'Elektr energiyasi va suv islohoti', amount: 30000, type: 'fixed' }, // fixed daily cost
  { id: '5', name: 'Tandirxona kunlik ijara to\'lovi', amount: 50000, type: 'fixed' }
];

/**
 * Format number to Uzbek Soum (so'm) or Kazakhstan Tenge (₸) with dual conversion based on system preference
 */
export function formatUZS(amount: number): string {
  const selectedCurrency = localStorage.getItem('nonvoy_currency') || 'UZS';
  
  if (selectedCurrency === 'KZT') {
    // Amount is in KZT. Convert to UZS (1 KZT = 27 UZS)
    const formattedKZT = new Intl.NumberFormat('ru-RU', {
      maximumFractionDigits: 0
    }).format(Math.round(amount));
    
    const uzsEquivalent = amount * 27;
    const formattedUZS = new Intl.NumberFormat('ru-RU', {
      maximumFractionDigits: 0
    }).format(Math.round(uzsEquivalent));
    
    return `${formattedKZT} ₸ (~${formattedUZS} so'm)`;
  }
  
  // Amount is in UZS. Convert to KZT (1 KZT = 27 UZS)
  const formattedUZS = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0
  }).format(Math.round(amount));
  
  const kztEquivalent = amount / 27;
  const formattedKZT = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0
  }).format(Math.round(kztEquivalent));
  
  return `${formattedUZS} so'm (~${formattedKZT} ₸)`;
}

/**
 * Format general numbers with commas
 */
export function formatNum(amount: number, fractionDigits = 0): string {
  return new Intl.NumberFormat('uz-UZ', {
    maximumFractionDigits: fractionDigits
  }).format(amount);
}
