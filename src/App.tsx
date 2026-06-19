/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Flame, Star, RefreshCw, Award, Sun, Moon, ArrowRight, HelpCircle, Check, BookOpen, DollarSign, Key, Calculator, Settings, Plus, Menu, X, Trash2, Palette, History, Edit2, Cloud, CloudOff, CloudLightning, Columns } from 'lucide-react';
import { DailyLog, CustomExpense, SalaryRecord, BreadSaleItem } from './types';
import { INITIAL_EXPENSES, formatUZS, formatNum } from './data';
import Ledger from './components/Ledger';
import HistoryTimeline from './components/HistoryTimeline';
import { testFirebaseConnection } from './firebase';
import { mergeAndFetchFromFirestore, backupAllToFirestore } from './firebaseSync';

const UzbekNonLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg className={`${className} select-none`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Golden crispy outer crust */}
    <circle cx="50" cy="50" r="46" fill="url(#non-crust-grad)" stroke="#8B4513" strokeWidth="2.5" />
    {/* Inner soft fluffy ring */}
    <circle cx="50" cy="50" r="34" fill="url(#non-inner-grad)" stroke="#D2691E" strokeWidth="1.5" strokeDasharray="4 2" />
    {/* Sunken patterned center (Chekich marks) */}
    <circle cx="50" cy="50" r="18" fill="#F4E6D6" stroke="#CD853F" strokeWidth="2" />
    {/* Chekich central star pattern */}
    <path d="M50 36 L50 64 M36 50 L64 50 M40 40 L60 60 M40 60 L60 40" stroke="#8B4513" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="50" cy="50" r="10" fill="none" stroke="#8B4513" strokeWidth="2" strokeDasharray="3 3" />
    <circle cx="50" cy="50" r="3" fill="#8B4513" />
    
    {/* Sesame seeds (Kunjut) sprinkled around the inner ring */}
    <ellipse cx="40" cy="24" rx="1.5" ry="3" transform="rotate(30 40 24)" fill="#1C1613" />
    <ellipse cx="62" cy="27" rx="1.5" ry="3" transform="rotate(-45 62 27)" fill="#1C1613" />
    <ellipse cx="74" cy="46" rx="1.5" ry="3" transform="rotate(15 74 46)" fill="#1C1613" />
    <ellipse cx="28" cy="60" rx="1.5" ry="3" transform="rotate(-15 28 60)" fill="#1C1613" />
    <ellipse cx="44" cy="76" rx="1.5" ry="3" transform="rotate(60 44 76)" fill="#1C1613" />
    <ellipse cx="62" cy="70" rx="1.5" ry="3" transform="rotate(-30 62 70)" fill="#1C1613" />
    
    <ellipse cx="50" cy="23" rx="1.2" ry="2.5" transform="rotate(-10 50 23)" fill="#FFFEEF" />
    <ellipse cx="30" cy="38" rx="1.2" ry="2.5" transform="rotate(40 30 38)" fill="#FFFEEF" />
    <ellipse cx="70" cy="36" rx="1.2" ry="2.5" transform="rotate(-20 70 36)" fill="#FFFEEF" />
    <ellipse cx="68" cy="58" rx="1.2" ry="2.5" transform="rotate(45 68 58)" fill="#FFFEEF" />
    <ellipse cx="34" cy="70" rx="1.2" ry="2.5" transform="rotate(-40 34 70)" fill="#FFFEEF" />
    <ellipse cx="54" cy="75" rx="1.2" ry="2.5" transform="rotate(10 54 75)" fill="#FFFEEF" />

    <defs>
      <radialGradient id="non-crust-grad" cx="50" cy="50" r="46" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FF8C00" />
        <stop offset="60%" stopColor="#E67E22" />
        <stop offset="90%" stopColor="#D35400" />
        <stop offset="100%" stopColor="#8B4513" />
      </radialGradient>
      <radialGradient id="non-inner-grad" cx="50" cy="50" r="34" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFF2E6" />
        <stop offset="50%" stopColor="#FFE4CC" />
        <stop offset="85%" stopColor="#F5B041" />
        <stop offset="100%" stopColor="#D35400" />
      </radialGradient>
    </defs>
  </svg>
);

const TRANSLATIONS = {
  uz: {
    settings: 'Sozlamalar',
    settingsTitle: '⚙️ Tizim Sozlamalari',
    settingsDesc: 'Orqa fon, shrift, til va standart non turlari sozlamalarini bu yerdan o\'zgartiring.',
    tabBg: '🎨 Orqa Fon',
    tabFont: '🔤 Shrift',
    tabLang: '🌐 Tillar (Languages)',
    tabBread: '🍞 Non Turlari',
    bgType: 'Fon Turi (Background Type)',
    bgGradients: 'Chiroyli Gradients',
    bgImages: 'Galereyadan Rasm',
    bgSelectGradient: 'Gradient Tanlash:',
    bgCustomLoad: 'Galereyadan Yuklash (Image Upload):',
    bgCustomBtn: '📁 Rasm Tanlash',
    bgCustomDelete: 'O\'chirish',
    bgNoImage: 'Rasm yuklanmagan',
    dimPct: 'To\'qlik (Overlay):',
    blurLevel: 'Xiralashtirish (Blur):',
    fontSelect: 'Yozuv Shrifti (Typography):',
    langSelect: 'Tizim Tili (App Language):',
    saveClose: 'Tayyor',
    welcomeTitle: 'Nonvoy Ish Daftari va Kalkulyatori',
    welcomeSubtitle: 'Tandirxonadagi kunni oson boshlang, xamir qorishni aniq rejalashtiring va kechqurun sotilgan nonlar hisobida sof foydani daftarda doimiy to\'plang.',
    howToTitle: 'Ish tartibi qo\'llanmasi (Saytdan qanday foydalaniladi?):',
    howToStep1: '☀️ 1. Ertalab tayyorlanadigan unni belgilang',
    howToStep1Desc: 'Ertalab un tayyorlayotganda qop sonini yozing. Shu zahoti suv, tuz, drojji retseptini olasiz va kutilayotgan non hajmini bilasiz.',
    howToStep2: '🌙 2. Kechqurun sotilgan nonni kiriting',
    howToStep2Desc: 'Kechasi sotilgan non dona sonini va necha puldan borganini kiritasiz. Tizim avtomatik barcha xarajatlarni yuklab sof foydani chiqaradi.',
    howToStep3: '📓 3. Tarixni jurnalda to\'plang',
    howToStep3Desc: 'Kechki yakundagi "Kun foydasini daftarga yozish" tugmasini bosing. Sizning butun oylik dars-tarixingiz shaxsiy jurnalda muhrlanadi.',
    resetBtn: 'Tarixni o\'chirish (Reset)',
    ledgerGoBtn: '📓 Jurnalga o\'tish',
    calculator: 'Kalkulyator',
    ledger: 'Jurnal (Daftar)',
    history: 'Batafsil Tarix',
    activeLabel: 'Faol:',
    cancel: 'Bekor qilish',
    breadPresetTitle: 'Standart non turlari va narxlari sozlamasi',
    breadPresetDesc: 'Bu yerda tayyorlanadigan standart non turlarining ro\'yxati va narxlarini sozlab qo\'ysangiz, har kecha sotuvni kiritayotganda ularni birgina tugma bilan tezda qo\'shishingiz mumkin. Sayt sozlamalaridan oson o\'zgaradi.',
    breadNameHeader: 'Non turi nomi',
    breadPriceHeader: 'Sotish narxi (so\'m)',
    breadWeightHeader: 'Vazni (gramm)',
    breadWeightLabel: 'Non Og\'irligi (g)',
    addPresetBtn: '+ Standart non turi qo\'shish'
  },
  en: {
    settings: 'Settings',
    settingsTitle: '⚙️ System Settings',
    settingsDesc: 'Change application background, typography, languages and default bread specs here.',
    tabBg: '🎨 Background',
    tabFont: '🔤 Font Style',
    tabLang: '🌐 Languages',
    tabBread: '🍞 Bread Specs',
    bgType: 'Background Type',
    bgGradients: 'Beautiful Gradients',
    bgImages: 'Gallery Image',
    bgSelectGradient: 'Select Gradient:',
    bgCustomLoad: 'Upload from Gallery (Image Upload):',
    bgCustomBtn: '📁 Choose Image',
    bgCustomDelete: 'Remove',
    bgNoImage: 'No image uploaded',
    dimPct: 'Dim Overlay:',
    blurLevel: 'Blur Level:',
    fontSelect: 'Font Typography:',
    langSelect: 'App Language:',
    saveClose: 'Done',
    welcomeTitle: "Baker's Notebook & Calculator",
    welcomeSubtitle: 'Easily begin bakery days, calculate exact dough water/yeast recipes, and securely capture daily net profits in your personal journal.',
    howToTitle: "Interactive Operational Manual (How to use):",
    howToStep1: "☀️ 1. Set morning flour capacity",
    howToStep1Desc: "Specify morning flour bags. Instantly get water, salt, & yeast recipe quantities and anticipated daily baking yields.",
    howToStep2: "🌙 2. Input evening sold quantities",
    howToStep2Desc: "Input final evening retail bread sale counts and rates. The system gathers pre-configured expenses to output net profit.",
    howToStep3: "📓 3. Commit daily data to history",
    howToStep3Desc: "Click 'Save profit to ledger' at lockup. Your entire multi-month transaction diary is securely preserved in memory.",
    resetBtn: 'Reset All History',
    ledgerGoBtn: '📓 Go to Journal',
    calculator: 'Calculator',
    ledger: 'Daftar (Journal)',
    history: 'Full Timeline',
    activeLabel: 'Active:',
    cancel: 'Cancel',
    breadPresetTitle: 'Default Bread Types & Rates Configuration',
    breadPresetDesc: 'Configure the list of default bread types and historical prices here. Quickly select them inside the evening multi-price calculator to save precious physical time.',
    breadNameHeader: 'Bread Type Name',
    breadPriceHeader: 'Default Selling Price (UZS)',
    breadWeightHeader: 'Weight (grams)',
    breadWeightLabel: 'Bread Weight (g)',
    addPresetBtn: '+ Add Default Bread Spec'
  },
  ru: {
    settings: 'Настройки',
    settingsTitle: '⚙️ Настройки Системы',
    settingsDesc: 'Настройте фоновые темы, шрифты, языки и стандартные сорта выпускаемого хлеба.',
    tabBg: '🎨 Задний Фон',
    tabFont: '🔤 Шрифты',
    tabLang: '🌐 Языки интерфейса',
    tabBread: '🍞 Сорта Хлеба',
    bgType: 'Тип Оформления',
    bgGradients: 'Градиенты',
    bgImages: 'Картинки',
    bgSelectGradient: 'Выберите Градиент:',
    bgCustomLoad: 'Загрузите свое изображение:',
    bgCustomBtn: '📁 Выбрать Фото',
    bgCustomDelete: 'Удалить',
    bgNoImage: 'Фото не загружено',
    dimPct: 'Затемнение фона:',
    blurLevel: 'Степень Размытия:',
    fontSelect: 'Типографика (Шрифт):',
    langSelect: 'Язык Системы:',
    saveClose: 'Готово',
    welcomeTitle: 'Журнал Пекаря и Калькулятор',
    welcomeSubtitle: 'Легко начинайте утро в тандырхане, точно рассчитывайте замес и сохраняйте чистую дневную выручку в личном журнале.',
    howToTitle: 'Инструкция по применению:',
    howToStep1: '☀️ 1. Укажите количество муки утром',
    howToStep1Desc: 'Введите утренние мешки муки. Сразу получите расчет воды, соли, дрожжей и прогнозируемый объем хлеба.',
    howToStep2: '🌙 2. Запишите итог продаж вечером',
    howToStep2Desc: 'Укажите проданное количество лепешек и цену. Калькулятор автоматически вычтет расходы и рассчитает чистую прибыль.',
    howToStep3: '📓 3. Сохраните операцию в журнал',
    howToStep3Desc: 'Нажмите кнопку "Записать прибыль дня в книгу" вечером. Вся месячная статистика зафиксируется в архивной книге.',
    resetBtn: 'Сбросить Историю (Reset)',
    ledgerGoBtn: '📓 Перейти к Журналу',
    calculator: 'Калькулятор',
    ledger: 'Журнал (Книга)',
    history: 'Хронология истории',
    activeLabel: 'Активно:',
    cancel: 'Отмена',
    breadPresetTitle: 'Настройка сортов хлеба и цен по умолчанию',
    breadPresetDesc: 'Задайте стандартный перечень сортов и цен вашего хлеба здесь, чтобы быстро добавлять их в вечерний баланс в один клик.',
    breadNameHeader: 'Название сорта',
    breadPriceHeader: 'Цена продажи (сум)',
    breadWeightHeader: 'Вес (грамм)',
    breadWeightLabel: 'Вес хлеба (г)',
    addPresetBtn: '+ Добавить стандартный сорт'
  }
};

const PRESET_GRADIENTS = [
  { id: 'golden-wheat', label: "🌾 Tilla Bug'doy", style: 'bg-gradient-to-r from-amber-700 to-amber-500', colorStyle: 'bg-amber-500' },
  { id: 'clay-oven', label: '🪵 Loy Tandir', style: 'bg-gradient-to-r from-[#532E1C] to-[#BD6231]', colorStyle: 'bg-[#BD6231]' },
  { id: 'coaly-charcoal', label: "🌋 Qora Ko'hna", style: 'bg-gradient-to-r from-[#201D1A] to-[#403B38]', colorStyle: 'bg-[#403B38]' },
  { id: 'warm-dough', label: '🍞 Issiq Xamir', style: 'bg-gradient-to-r from-[#4E413B] to-[#C1A897]', colorStyle: 'bg-[#C1A897]' },
  { id: 'turquoise-mint', label: '💎 Beruza Yalpiz', style: 'bg-gradient-to-r from-teal-500 to-emerald-400', colorStyle: 'bg-teal-500' },
  { id: 'sunset-peach', label: '🌅 Subhidam', style: 'bg-gradient-to-r from-orange-500 to-rose-400', colorStyle: 'bg-orange-500' },
  { id: 'sky-blue', label: '🌌 Moviy Osmon', style: 'bg-gradient-to-r from-blue-500 to-cyan-400', colorStyle: 'bg-blue-500' },
  { id: 'lavender-blossom', label: '🪻 Lavanda', style: 'bg-gradient-to-r from-violet-500 to-pink-400', colorStyle: 'bg-violet-500' },
  { id: 'spring-mint', label: '🌿 Bahoriy Sabza', style: 'bg-gradient-to-r from-green-500 to-lime-400', colorStyle: 'bg-green-500' },
  { id: 'sunflower-gold', label: '🌻 Kungaboqar', style: 'bg-gradient-to-r from-yellow-600 to-amber-400', colorStyle: 'bg-yellow-500' }
];

export default function App() {
  // Navigation sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [bakerName, setBakerName] = useState<string>(() => {
    const saved = localStorage.getItem('nonvoy_baker_name') || '';
    if (saved === 'Sardor') {
      localStorage.setItem('nonvoy_baker_name', '');
      return '';
    }
    return saved;
  });
  const [isEditingBakerName, setIsEditingBakerName] = useState<boolean>(false);
  const [bakerNameInput, setBakerNameInput] = useState<string>('');

  useEffect(() => {
    if (bakerName) {
      document.title = `${bakerName} Nonvoy Daftari 🌾`;
    } else {
      document.title = "Nonvoy Daftari - Un va Daromad Jurnali";
    }
  }, [bakerName]);

  const saveBakerName = (val: string) => {
    const cleaned = val.replace(/[^a-zA-Zа-яА-ЯёЁo'O'g'G'\s]/g, '').trim(); // faqat harflar va ism yozilsin
    setBakerName(cleaned);
    localStorage.setItem('nonvoy_baker_name', cleaned);
    setIsEditingBakerName(false);
  };

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<'bg' | 'font' | 'lang' | 'bread'>('bg');
  const [deleteSalaryConfirmId, setDeleteSalaryConfirmId] = useState<string | null>(null);
  const [deleteRowConfirmId, setDeleteRowConfirmId] = useState<string | null>(null);
  const [deletePresetConfirmId, setDeletePresetConfirmId] = useState<string | null>(null);
  const [deleteCustomBgConfirm, setDeleteCustomBgConfirm] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // New Language State
  const [language, setLanguage] = useState<'uz' | 'en' | 'ru'>(() => {
    return (localStorage.getItem('nonvoy_lang') as 'uz' | 'en' | 'ru') || 'uz';
  });

  useEffect(() => {
    localStorage.setItem('nonvoy_lang', language);
  }, [language]);

  // New Font State
  const [activeFont, setActiveFont] = useState<string>(() => {
    return localStorage.getItem('nonvoy_font') || 'font-inter';
  });

  useEffect(() => {
    localStorage.setItem('nonvoy_font', activeFont);
  }, [activeFont]);

  // Background Customization States
  const [bgType, setBgType] = useState<'gradient' | 'image'>(() => {
    return (localStorage.getItem('nonvoy_bg_type') as any) || 'gradient';
  });
  const [bgPreset, setBgPreset] = useState<string>(() => {
    return localStorage.getItem('nonvoy_bg_preset') || 'golden-wheat';
  });
  const [bgCustomImage, setBgCustomImage] = useState<string | null>(() => {
    return localStorage.getItem('nonvoy_bg_custom_image') || null;
  });
  const [bgOverlayOpacity, setBgOverlayOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('nonvoy_bg_opacity');
    return saved ? parseInt(saved) : 40;
  });
  const [bgBlur, setBgBlur] = useState<number>(() => {
    const saved = localStorage.getItem('nonvoy_bg_blur');
    return saved ? parseInt(saved) : 4;
  });

  useEffect(() => {
    localStorage.setItem('nonvoy_bg_type', bgType);
  }, [bgType]);

  useEffect(() => {
    localStorage.setItem('nonvoy_bg_preset', bgPreset);
  }, [bgPreset]);

  useEffect(() => {
    if (bgCustomImage) {
      localStorage.setItem('nonvoy_bg_custom_image', bgCustomImage);
    } else {
      localStorage.removeItem('nonvoy_bg_custom_image');
    }
  }, [bgCustomImage]);

  useEffect(() => {
    localStorage.setItem('nonvoy_bg_opacity', bgOverlayOpacity.toString());
  }, [bgOverlayOpacity]);

  useEffect(() => {
    localStorage.setItem('nonvoy_bg_blur', bgBlur.toString());
  }, [bgBlur]);

  const getBackgroundStyle = () => {
    if (bgType === 'image' && bgCustomImage) {
      return {
        backgroundImage: `url(${bgCustomImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    }
    return {};
  };

  const getBackgroundClass = () => {
    if (bgType === 'image' && bgCustomImage) {
      return '';
    }
    if (bgPreset === 'coaly-charcoal') {
      return theme === 'dark'
        ? 'bg-gradient-to-br from-[#0F0C0B] via-[#1A1513] to-[#251D1A] text-[#EDE8E0]'
        : 'bg-gradient-to-br from-[#F7F5F0] via-[#EAE5DC] to-[#DAD3C5] text-[#3E2E26]';
    }
    if (bgPreset === 'clay-oven') {
      return theme === 'dark'
        ? 'bg-gradient-to-br from-[#211107] via-[#3A1D0B] to-[#45220C] text-[#FBE3D1]'
        : 'bg-gradient-to-br from-[#FFFBF5] via-[#FBDEC0] to-[#F7C695] text-[#4E2409]';
    }
    if (bgPreset === 'warm-dough') {
      return theme === 'dark'
        ? 'bg-gradient-to-br from-[#191512] via-[#241D18] to-[#2F251F] text-[#F3EFE0]'
        : 'bg-gradient-to-br from-[#FFFFFC] via-[#FAF9F2] to-[#F1ECD1] text-[#4A3B32]';
    }
    if (bgPreset === 'turquoise-mint') {
      return theme === 'dark'
        ? 'bg-gradient-to-br from-[#021A15] via-[#08302A] to-[#144740] text-[#E0FAF5]'
        : 'bg-gradient-to-br from-[#EEFCF9] via-[#C9FAF1] to-[#9BF0DF] text-[#143B33]';
    }
    if (bgPreset === 'sunset-peach') {
      return theme === 'dark'
        ? 'bg-gradient-to-br from-[#240C07] via-[#42150D] to-[#5F2115] text-[#FFE8E2]'
        : 'bg-gradient-to-br from-[#FFF5F2] via-[#FFE2D9] to-[#FFC7B8] text-[#4A1A0F]';
    }
    if (bgPreset === 'sky-blue') {
      return theme === 'dark'
        ? 'bg-gradient-to-br from-[#031524] via-[#092742] to-[#123E63] text-[#ECF6FF]'
        : 'bg-gradient-to-br from-[#F0F7FF] via-[#D0E6FF] to-[#A3D0FF] text-[#0D2540]';
    }
    if (bgPreset === 'lavender-blossom') {
      return theme === 'dark'
        ? 'bg-gradient-to-br from-[#12071F] via-[#210D36] to-[#341852] text-[#F3EDFF]'
        : 'bg-gradient-to-br from-[#F9F5FF] via-[#ECD9FF] to-[#D9B3FF] text-[#2F1551]';
    }
    if (bgPreset === 'spring-mint') {
      return theme === 'dark'
        ? 'bg-gradient-to-br from-[#061A0C] via-[#0F3019] to-[#1C4B2A] text-[#EDFFE9]'
        : 'bg-gradient-to-br from-[#F4FCF5] via-[#D5F4DB] to-[#AEEAB9] text-[#113C16]';
    }
    if (bgPreset === 'sunflower-gold') {
      return theme === 'dark'
        ? 'bg-gradient-to-br from-[#211703] via-[#3B2907] to-[#59400D] text-[#FFFBEB]'
        : 'bg-gradient-to-br from-[#FFFDF0] via-[#FFF5C2] to-[#FFE785] text-[#4F3C0C]';
    }
    // golden-wheat (Default fallback)
    return theme === 'dark'
      ? 'bg-gradient-to-br from-[#1C1208] via-[#2F1B0A] to-[#3F250F] text-[#FCEEE2]'
      : 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E0] to-[#F3DEC3] text-[#3E240D]';
  };

  // Active sub-tab inside the compact calculator: morning or evening
  const [calculatorTab, setCalculatorTab] = useState<'morning' | 'evening'>(() => {
    const hour = new Date().getHours();
    return hour >= 15 ? 'evening' : 'morning';
  });

  const scrollToSection = (id: string) => {
    setIsSidebarOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Dark/Light Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('nonvoy_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  // Split View / Dual Window View state
  const [isSplitView, setIsSplitView] = useState<boolean>(() => {
    const saved = localStorage.getItem('nonvoy_split_view');
    return saved === 'true';
  });

  // Employee Salaries tracking state
  const [salaries, setSalaries] = useState<SalaryRecord[]>(() => {
    const saved = localStorage.getItem('nonvoy_salaries');
    return saved ? JSON.parse(saved) : [
      { id: 'sal-1', workerName: 'Hasanboy (Xamirchi)', amount: 150000, date: new Date().toISOString().split('T')[0], period: 'kunlik', note: 'Kunlik smena to\'liq berildi' },
      { id: 'sal-2', workerName: 'Erkinboy (Yordamchi)', amount: 80000, date: new Date().toISOString().split('T')[0], period: 'kunlik', note: 'Kunlik yordamchi' }
    ];
  });

  // Salary form states
  const [showSalaryForm, setShowSalaryForm] = useState<boolean>(false);
  const [salaryName, setSalaryName] = useState<string>('');
  const [salaryAmount, setSalaryAmount] = useState<number>(100000);
  const [salaryDate, setSalaryDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [salaryPeriod, setSalaryPeriod] = useState<'kunlik' | 'haftalik' | 'oylik'>('kunlik');
  const [salaryNote, setSalaryNote] = useState<string>('');

  // Primary states representing the daily run
  const [bagsCount, setBagsCount] = useState<number>(3); // 3 qop un
  const [breadPerBag, setBreadPerBag] = useState<number>(395); // 1 qopdan 395 dona non
  const [flourPrice, setFlourPrice] = useState<number>(280000); // 1 qop un narxi (so'm)
  const [sellingPrice, setSellingPrice] = useState<number>(3000); // bir dona non sotish narxi

  // Evening Inputs for final output calculation
  const [eveningDate, setEveningDate] = useState<string>(() => new Date().toISOString().split('T')[0]); // Custom Date for independent daily recall
  const [eveningSoldBreads, setEveningSoldBreads] = useState<number>(1185); // sold loaves count
  const [eveningSellingPrice, setEveningSellingPrice] = useState<number>(3000); // actual price sold at
  const [eveningDamagedBreads, setEveningDamagedBreads] = useState<number>(5); // damaged / family use / gifts
  const [eveningFlourPrice, setEveningFlourPrice] = useState<number>(280000); // raw flour sack price today
  const [eveningNote, setEveningNote] = useState<string>(''); // custom note for the ledger

  // Multi-price bread calculator states
  const [useMultiPrice, setUseMultiPrice] = useState<boolean>(false);
  const [breadSalesList, setBreadSalesList] = useState<BreadSaleItem[]>([
    { id: '1', name: "Standard Non", price: 3000, quantity: 100, weight: 450 }
  ]);

  // Master bread preset configuration state
  const [defaultBreadPresets, setDefaultBreadPresets] = useState<BreadSaleItem[]>(() => {
    const saved = localStorage.getItem('nonvoy_bread_presets');
    return saved ? JSON.parse(saved) : [
      { id: 'dp-1', name: "Standard Non", price: 3000, quantity: 100, weight: 450 },
      { id: 'dp-2', name: "Patar Non", price: 5000, quantity: 50, weight: 600 },
      { id: 'dp-3', name: "Shirmoy Non", price: 4500, quantity: 50, weight: 500 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('nonvoy_bread_presets', JSON.stringify(defaultBreadPresets));
  }, [defaultBreadPresets]);

  // Modal form states for adding a new bread type via Popup
  const [isBreadAddModalOpen, setIsBreadAddModalOpen] = useState<boolean>(false);
  const [modalBreadName, setModalBreadName] = useState<string>('');
  const [modalBreadPrice, setModalBreadPrice] = useState<number>(3000);
  const [modalBreadQty, setModalBreadQty] = useState<number>(100);
  const [modalBreadWeight, setModalBreadWeight] = useState<number>(450);

  // Sync evening inputs automatically when morning estimates change to prevent repetitive typing
  useEffect(() => {
    setEveningSoldBreads(Math.max(0, Math.ceil(bagsCount * breadPerBag) - eveningDamagedBreads));
  }, [bagsCount, breadPerBag, eveningDamagedBreads]);

  useEffect(() => {
    setEveningSellingPrice(sellingPrice);
  }, [sellingPrice]);

  useEffect(() => {
    setEveningFlourPrice(flourPrice);
  }, [flourPrice]);

  // Secondary data states
  const [expenses, setExpenses] = useState<CustomExpense[]>(() => {
    const saved = localStorage.getItem('nonvoy_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [logs, setLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('nonvoy_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Firebase synchronizer states
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState<boolean>(false);

  // Initial load and merge from Firebase Firestore
  useEffect(() => {
    async function initFirebaseSync() {
      const connected = await testFirebaseConnection();
      setFirebaseConnected(connected);
      if (connected) {
        setSyncStatus('syncing');
        try {
          const { mergedLogs, mergedExpenses, mergedSalaries } = await mergeAndFetchFromFirestore(
            JSON.parse(localStorage.getItem('nonvoy_logs') || '[]'),
            JSON.parse(localStorage.getItem('nonvoy_expenses') || '[]'),
            JSON.parse(localStorage.getItem('nonvoy_salaries') || '[]')
          );
          setLogs(mergedLogs);
          setExpenses(mergedExpenses);
          setSalaries(mergedSalaries);
          setSyncStatus('success');
        } catch (e) {
          console.error("Firebase initial sync failed:", e);
          setSyncStatus('error');
        }
      }
      setIsFirebaseInitialized(true);
    }
    initFirebaseSync();
  }, []);

  // Automatic real-time backup to Firebase Firestore (debounced)
  useEffect(() => {
    if (!isFirebaseInitialized || !firebaseConnected) return;

    const delayDebounceFn = setTimeout(async () => {
      setSyncStatus('syncing');
      try {
        await backupAllToFirestore(logs, expenses, salaries);
        setSyncStatus('success');
      } catch (err) {
        console.error("Firebase auto backup failed:", err);
        setSyncStatus('error');
      }
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [logs, expenses, salaries, isFirebaseInitialized, firebaseConnected]);

  // Save changes to localStorage for persistent durability
  useEffect(() => {
    localStorage.setItem('nonvoy_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('nonvoy_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('nonvoy_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('nonvoy_split_view', isSplitView ? 'true' : 'false');
  }, [isSplitView]);

  useEffect(() => {
    localStorage.setItem('nonvoy_salaries', JSON.stringify(salaries));
  }, [salaries]);

  // Cost calculations
  const fixedExpensesDaily = expenses
    .filter(e => e.type === 'fixed')
    .reduce((sum, e) => sum + e.amount, 0);

  const unitExpensesPerBag = expenses
    .filter(e => e.type === 'per_bag')
    .reduce((sum, e) => sum + e.amount, 0);

  // Expected output variables
  const expectedTotalBreads = Math.ceil(bagsCount * breadPerBag);

  // Active recipes guide calculations
  const waterLiters = (bagsCount * 50 * 58) / 100; // Obi non hydration 58%
  const saltKg = (bagsCount * 50 * 1.8) / 100;    // salt 1.8%
  const yeastKg = (bagsCount * 50 * 1.0) / 100;   // yeast 1.0%

  // Save final calculated logs into ledger database
  const handleAddLog = (newLog: DailyLog) => {
    // If a log for this date already exists, replace it, otherwise add a new log!
    setLogs(prev => {
      const existsIdx = prev.findIndex(item => item.date === newLog.date);
      if (existsIdx > -1) {
        const updated = [...prev];
        updated[existsIdx] = newLog;
        return updated;
      } else {
        return [newLog, ...prev];
      }
    });
    
    // Animation success toast
    const feedback = document.getElementById('success-pulse');
    if (feedback) {
      feedback.classList.remove('opacity-0');
      feedback.classList.add('opacity-100');
      setTimeout(() => {
        feedback.classList.remove('opacity-100');
        feedback.classList.add('opacity-0');
      }, 4000);
    }
  };

  // Add salary record
  const handleAddSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryName.trim()) return;

    const newRecord: SalaryRecord = {
      id: 'sal-' + Date.now(),
      workerName: salaryName.trim(),
      amount: salaryAmount,
      date: salaryDate,
      period: salaryPeriod,
      note: salaryNote.trim() || undefined
    };

    setSalaries(prev => [newRecord, ...prev]);
    setSalaryName('');
    setSalaryAmount(100000);
    setSalaryDate(new Date().toISOString().split('T')[0]);
    setSalaryPeriod('kunlik');
    setSalaryNote('');
    setShowSalaryForm(false);
  };

  // Delete salary record
  const handleDeleteSalary = (id: string) => {
    setSalaries(prev => prev.filter(s => s.id !== id));
  };

  // Manage dynamic bread sales list
  const handleAddBreadSaleRow = () => {
    // If presets are available, initialize with first preset
    if (defaultBreadPresets.length > 0) {
      setModalBreadName(defaultBreadPresets[0].name || '');
      setModalBreadPrice(defaultBreadPresets[0].price || 3000);
      setModalBreadWeight(defaultBreadPresets[0].weight || 450);
    } else {
      setModalBreadName('');
      setModalBreadPrice(eveningSellingPrice || 3000);
      setModalBreadWeight(450);
    }
    setModalBreadQty(100);
    setIsBreadAddModalOpen(true);
  };

  const handleUpdateBreadSaleRow = (id: string, field: keyof BreadSaleItem, value: any) => {
    setBreadSalesList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleRemoveBreadSaleRow = (id: string) => {
    if (breadSalesList.length <= 1) {
      alert("Kamida bitta non turi bo'lishi shart!");
      return;
    }
    setBreadSalesList(prev => prev.filter(item => item.id !== id));
  };

  // Master bread presets handlers
  const handleAddPreset = () => {
    const newPreset: BreadSaleItem = {
      id: 'dp-' + Date.now(),
      name: `Yangi Non`,
      price: 3000,
      quantity: 100,
      weight: 450
    };
    setDefaultBreadPresets(prev => [...prev, newPreset]);
  };

  const handleUpdatePreset = (id: string, field: keyof BreadSaleItem, value: any) => {
    setDefaultBreadPresets(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleRemovePreset = (id: string) => {
    if (defaultBreadPresets.length <= 1) {
      alert("Kamida bitta standart non turi ro'yxatda bo'lishi shart!");
      return;
    }
    setDefaultBreadPresets(prev => prev.filter(item => item.id !== id));
  };

  // Perform Evening Workflow Calculation & addition to book
  const handleSaveEveningLog = (e: React.FormEvent) => {
    e.preventDefault();

    const bags = Number(bagsCount);
    const flPrice = Number(eveningFlourPrice);
    const damaged = Number(eveningDamagedBreads);

    const totalBreads = Math.ceil(bags * breadPerBag);
    
    // Revenue and sold calculation based on whether multi-price is enabled or not
    const sold = useMultiPrice
      ? breadSalesList.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
      : Number(eveningSoldBreads);
    
    const price = useMultiPrice
      ? (sold > 0 ? Math.round(breadSalesList.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.price || 0)), 0) / sold) : Number(eveningSellingPrice))
      : Number(eveningSellingPrice);

    const revenue = useMultiPrice
      ? breadSalesList.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.price || 0)), 0)
      : sold * price;

    // Total expenses: (bags * flourPrice) + (bags * variable expense per bag) + fixed daily charges
    const extraBagExpenses = bags * unitExpensesPerBag;
    const totalCost = (bags * flPrice) + extraBagExpenses + fixedExpensesDaily;
    const profit = revenue - totalCost;

    const newLog: DailyLog = {
      id: 'log-' + Date.now(),
      date: eveningDate,
      bagsUsed: bags,
      breadPerBag: breadPerBag,
      totalBreads: totalBreads,
      damagedBreads: damaged,
      sellingPrice: price,
      flourPricePerBag: flPrice,
      additionalExpenses: extraBagExpenses + fixedExpensesDaily,
      calculatedRevenue: revenue,
      calculatedCost: totalCost,
      calculatedProfit: profit,
      note: eveningNote.trim() || undefined,
      breadSales: useMultiPrice ? breadSalesList : undefined
    };

    handleAddLog(newLog);
    
    // Reset inputs
    setEveningNote('');
    
    // Scroll to registry
    setTimeout(() => {
      const ledgerEl = document.getElementById('ledger-section');
      if (ledgerEl) {
        ledgerEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  // Easy Reset
  const handleDataReset = () => {
    if (confirm("Diqqat! Barcha sozlangan xarajatlar, oyliklar va saqlangan kundalik daftarlaringizni dastlabki holatga qaytarasizmi?")) {
      setExpenses(INITIAL_EXPENSES);
      setLogs([]);
      setSalaries([
        { id: 'sal-1', workerName: 'Hasanboy (Xamirchi)', amount: 150000, date: new Date().toISOString().split('T')[0], period: 'kunlik', note: 'Kunlik smena to\'liq berildi' },
        { id: 'sal-2', workerName: 'Erkinboy (Yordamchi)', amount: 80000, date: new Date().toISOString().split('T')[0], period: 'kunlik', note: 'Kunlik yordamchi' }
      ]);
      setBagsCount(3);
      setBreadPerBag(395);
      setFlourPrice(280000);
      setSellingPrice(3000);
      setEveningDamagedBreads(5);
      setEveningNote('');
    }
  };

  const totalNetProfit = logs.reduce((sum, item) => sum + item.calculatedProfit, 0);
  const totalBagsUsed = logs.reduce((sum, item) => sum + item.bagsUsed, 0);

  return (
    <div 
      className={`min-h-screen flex flex-row ${activeFont} transition-all duration-300 relative overflow-x-hidden ${getBackgroundClass()}`}
      style={getBackgroundStyle()}
    >
      
      {/* Background Glassy Blur Overlay */}
      <div 
        className="fixed inset-0 z-0 transition-opacity duration-300 pointer-events-none" 
        style={{
          backgroundColor: theme === 'dark' ? '#140c08' : '#FAF6F0',
          opacity: bgOverlayOpacity / 100,
          backdropFilter: `blur(${bgBlur}px)`,
          WebkitBackdropFilter: `blur(${bgBlur}px)`,
        }}
      />
      
      {/* PERFECT SLIM DESKTOP RAIL (Auto expands on hover, keeps active logos cleanly visible) */}
      <aside 
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
        className={`hidden md:flex flex-col items-center justify-between py-6 border-r transition-all duration-300 shrink-0 relative z-35 ${
          isSidebarOpen ? 'w-64 shadow-[10px_0_30px_rgba(217,119,6,0.06)]' : 'w-16'
        } ${
          theme === 'dark' 
            ? 'bg-[#1E1916]/95 border-[#322520]' 
            : 'bg-[#FAF6F0]/95 border-amber-200/40'
        }`}
      >
        <div className="flex flex-col items-center w-full gap-8">
          {/* Flame Icon Branding / Uzbek Non Logo */}
          <div className="flex items-center gap-2.5 px-3.5 w-full justify-center lg:justify-start">
            <div className="w-10 h-10 shrink-0 cursor-pointer" onClick={() => setIsSettingsModalOpen(true)} title="Tizim sozlamalari">
              <UzbekNonLogo className="w-10 h-10 transform hover:scale-110 transition-transform duration-300" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col select-none overflow-hidden max-w-[170px]">
                {isEditingBakerName ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      className="w-28 text-xs font-bold bg-amber-500/10 border border-amber-500/50 rounded px-1.5 py-0.5 text-amber-500 outline-none focus:ring-1 focus:ring-amber-500"
                      value={bakerNameInput}
                      onChange={(e) => setBakerNameInput(e.target.value)}
                      onBlur={() => saveBakerName(bakerNameInput)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveBakerName(bakerNameInput);
                        if (e.key === 'Escape') setIsEditingBakerName(false);
                      }}
                      autoFocus
                      placeholder="Ismingiz..."
                    />
                    <button 
                      onClick={() => saveBakerName(bakerNameInput)}
                      className="p-1 text-emerald-500 hover:bg-emerald-500/20 rounded cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 group cursor-pointer" onClick={() => {
                    setBakerNameInput(bakerName);
                    setIsEditingBakerName(true);
                  }}>
                    <span className={`font-sans font-black tracking-tight text-[13px] text-amber-500 truncate ${!bakerName ? 'animate-pulse' : ''}`} title="Ismni o'zgartirish uchun bosing">
                      {bakerName ? `${bakerName} Tizimi` : "Ismingizni kiriting ✏️"}
                    </span>
                    <Edit2 className="w-3 h-3 text-amber-500/50 group-hover:text-amber-500 transition-colors shrink-0" />
                  </div>
                )}
                <span className="text-[9px] text-slate-400 font-bold block whitespace-nowrap">Dastyor jurnali 🌾</span>
              </div>
            )}
          </div>

          {/* Quick anchor guides */}
          <nav className="flex flex-col gap-3 w-full px-2">
            <button
              onClick={() => scrollToSection('calculator-section')}
              className="p-3 w-full rounded-xl flex items-center gap-3 transition-all cursor-pointer scale-100 hover:scale-105 hover:bg-amber-500/10 hover:text-amber-500 text-amber-500"
              title="Kalkulyator"
            >
              <Calculator className="w-5 h-5 shrink-0 text-amber-500" />
              {isSidebarOpen && (
                <span className="text-xs font-black uppercase tracking-wider animate-fade-in whitespace-nowrap">
                  📊 Kalkulyator
                </span>
              )}
            </button>

            <button
              onClick={() => scrollToSection('ledger-section')}
              className="p-3 w-full rounded-xl flex items-center gap-3 transition-all cursor-pointer scale-100 hover:scale-105 hover:bg-amber-500/10 hover:text-amber-500 text-amber-500"
              title={TRANSLATIONS[language].ledger}
            >
              <BookOpen className="w-5 h-5 shrink-0 text-amber-500" />
              {isSidebarOpen && (
                <span className="text-xs font-black uppercase tracking-wider animate-fade-in whitespace-nowrap">
                  📓 {TRANSLATIONS[language].ledger}
                </span>
              )}
            </button>

            <button
              onClick={() => scrollToSection('history-timeline')}
              className="p-3 w-full rounded-xl flex items-center gap-3 transition-all cursor-pointer scale-100 hover:scale-105 hover:bg-amber-500/10 hover:text-amber-500 text-amber-500"
              title={TRANSLATIONS[language].history}
            >
              <History className="w-5 h-5 shrink-0 text-amber-500" />
              {isSidebarOpen && (
                <span className="text-xs font-black uppercase tracking-wider animate-fade-in whitespace-nowrap">
                  📜 {TRANSLATIONS[language].history}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Action Bottom Settings */}
        <div className="w-full px-2 space-y-3">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-3 w-full rounded-xl flex items-center gap-3 transition-all cursor-pointer scale-100 hover:scale-105 hover:bg-amber-500/10 hover:text-amber-500 text-amber-500"
            title={TRANSLATIONS[language].settings}
          >
            <Settings className="w-5 h-5 shrink-0 text-amber-500" />
            {isSidebarOpen && (
              <span className="text-xs font-black uppercase tracking-wider animate-fade-in whitespace-nowrap">
                ⚙️ {TRANSLATIONS[language].settings}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* VIEWPORT SCROLL WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
        
        {/* SUCCESS MESSAGE ACTION PILL */}
        <div 
          id="success-pulse" 
          className="fixed top-20 right-6 z-55 pointer-events-none opacity-0 transition-opacity duration-350 bg-gradient-to-r from-emerald-600 to-teal-550 text-white rounded-2xl px-5 py-3 shadow-xl shadow-emerald-900/20 border border-emerald-400/30 flex items-center gap-2"
        >
          <Check className="w-4 h-4 animate-bounce text-emerald-100" />
          <span className="text-xs font-bold">Kunning foyda hisoboti muvaffaqiyatli saqlandi!</span>
        </div>

        {/* APPLICATION MOBILE/DESKTOP HEADER */}
        <header className={`py-3 px-4 sm:px-6 lg:px-8 border-b flex items-center justify-between z-30 shrink-0 sticky top-0 backdrop-blur ${
          theme === 'dark' 
            ? 'bg-[#1C1613]/90 border-[#312620]' 
            : 'bg-[#FEFBF7]/90 border-amber-100/50'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 rounded-xl border border-amber-500/20 hover:border-amber-500/50 bg-amber-500/5 transition-all text-amber-600 block md:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 shrink-0 transform hover:rotate-12 transition-transform duration-300">
                <UzbekNonLogo className="w-10 h-10" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span 
                    onClick={() => {
                      setBakerNameInput(bakerName);
                      setIsEditingBakerName(true);
                      setIsSidebarOpen(true);
                    }}
                    className={`text-[11px] font-black bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-md border border-amber-500/20 leading-none cursor-pointer hover:bg-amber-500/20 transition-colors select-none ${!bakerName ? 'animate-pulse text-amber-600 border-amber-500/40 bg-amber-500/20 font-bold' : ''}`}
                    title="Ismni o'zgartirish uchun bosing"
                  >
                    {bakerName || "Ismingizni kiriting ✏️"}
                  </span>
                  <h1 className="text-xs sm:text-sm font-black uppercase tracking-widest leading-none text-slate-900 dark:text-slate-100">Daftari</h1>
                </div>
                <span className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-400 leading-none block font-mono">Nonvoylik hisob jurnali</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cloud Sync Status Pill */}
            <div className={`flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border font-mono text-[9px] sm:text-[10px] uppercase font-bold select-none transition-all ${
              !firebaseConnected
                ? 'bg-rose-500/5 border-rose-500/10 text-rose-505 text-rose-400'
                : syncStatus === 'syncing'
                ? 'bg-amber-500/5 border-amber-500/10 text-amber-500 animate-pulse'
                : syncStatus === 'error'
                ? 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500'
            }`} title="Firebase Cloud Zaxirasi">
              {!firebaseConnected ? (
                <>
                  <CloudOff className="w-3.5 h-3.5 shrink-0" />
                  <span className="leading-none">Oflayn</span>
                </>
              ) : syncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span className="hidden xs:inline leading-none">Sinxronlash...</span>
                </>
              ) : syncStatus === 'error' ? (
                <>
                  <CloudLightning className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="leading-none">Xato</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 fill-emerald-500/10 shrink-0" />
                  <span className="hidden xs:inline leading-none text-emerald-500">Bulutda</span>
                </>
              )}
            </div>

            {/* Split View Toggle Button */}
            <button
              onClick={() => setIsSplitView(!isSplitView)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer border flex items-center gap-1.5 text-xs font-black ${
                theme === 'dark'
                  ? isSplitView
                    ? 'bg-amber-600/20 border-amber-500 text-amber-400 hover:bg-amber-600/30 font-semibold'
                    : 'bg-[#2E241E] border-[#42342A] text-slate-400 hover:bg-[#392C23] hover:text-slate-250 font-semibold'
                  : isSplitView
                    ? 'bg-amber-600 text-white border-transparent shadow shadow-amber-600/30'
                    : 'bg-amber-100/60 border-amber-200 text-amber-800 hover:bg-amber-100'
              }`}
              title={isSplitView ? "Standart rejimga qaytish" : "Ikkita oynali rejimga o'tish"}
            >
              <Columns className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline-block text-[9px] font-black uppercase tracking-wider leading-none">
                {isSplitView ? "1-Oyna (Normal)" : "2x Oyna (Split)"}
              </span>
            </button>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                theme === 'dark' ? 'bg-[#2E241E] border-[#42342A] text-amber-400 hover:bg-[#392C23]' : 'bg-amber-100/60 border-amber-200 text-[#CD853F] hover:bg-amber-100'
              }`}
              title="Qorong'u/Yorug'"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 animate-spin-slow" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* MOBILE SIDEBAR OVERLAY */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-350 cursor-pointer" 
              onClick={() => setIsSidebarOpen(false)} 
            />
            
            <aside 
              className={`relative w-80 max-w-[85vw] h-full p-6 flex flex-col justify-between border-r shadow-2xl transition-transform duration-350 z-10 ${
                theme === 'dark' 
                  ? 'bg-[#1E1916] text-[#EDE8E0] border-[#312620]' 
                  : 'bg-[#FAF6F0] text-[#3E2E26] border-amber-100'
              }`}
            >
              <div className="flex flex-col h-full overflow-y-auto space-y-6">
                
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b pb-4 border-amber-900/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 shrink-0">
                      <UzbekNonLogo className="w-10 h-10" />
                    </div>
                    <div className="flex flex-col max-w-[140px]">
                      {isEditingBakerName ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            className="w-24 text-xs font-bold bg-amber-500/10 border border-amber-500/50 rounded px-1.5 py-0.5 text-amber-500 outline-none"
                            value={bakerNameInput}
                            onChange={(e) => setBakerNameInput(e.target.value)}
                            onBlur={() => saveBakerName(bakerNameInput)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveBakerName(bakerNameInput);
                              if (e.key === 'Escape') setIsEditingBakerName(false);
                            }}
                            autoFocus
                            placeholder="Ism..."
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 group cursor-pointer" onClick={() => {
                          setBakerNameInput(bakerName);
                          setIsEditingBakerName(true);
                        }}>
                          <span className="text-xs font-black leading-tight text-amber-500 truncate" title="O'zgartirish uchun bosing">
                            {bakerName} Nonvoy
                          </span>
                          <Edit2 className="w-2.5 h-2.5 text-amber-500/50 shrink-0" />
                        </div>
                      )}
                      <span className="text-[9px] font-mono text-slate-400">Dastyor jurnali 🌾</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 px-2.5 border rounded-lg text-slate-400 hover:text-amber-500 border-amber-500/25 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Navigation links */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      scrollToSection('calculator-section');
                    }}
                    className="w-full px-4 py-3 rounded-xl flex items-center gap-3.5 text-xs font-black uppercase tracking-wider transition-all border border-transparent hover:bg-amber-500/10 text-amber-500 text-left"
                  >
                    <Calculator className="w-5 h-5 text-amber-500" />
                    <span>📈 {TRANSLATIONS[language].calculator}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      scrollToSection('ledger-section');
                    }}
                    className="w-full px-4 py-3 rounded-xl flex items-center justify-between text-xs font-black uppercase tracking-wider transition-all border border-transparent hover:bg-amber-500/10 text-amber-500"
                  >
                    <div className="flex items-center gap-3.5">
                      <BookOpen className="w-5 h-5 text-amber-500" />
                      <span>📓 {TRANSLATIONS[language].ledger}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-950 font-mono text-amber-300">
                      {logs.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      scrollToSection('history-timeline');
                    }}
                    className="w-full px-4 py-3 rounded-xl flex items-center justify-between text-xs font-black uppercase tracking-wider transition-all border border-transparent hover:bg-amber-500/10 text-amber-500"
                  >
                    <div className="flex items-center gap-3.5">
                      <History className="w-5 h-5 text-amber-500" />
                      <span>📜 {TRANSLATIONS[language].history}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-950 font-mono text-amber-350 font-bold">
                      {logs.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      setIsSettingsModalOpen(true);
                    }}
                    className="w-full px-4 py-3 rounded-xl flex items-center gap-3.5 text-xs font-black uppercase tracking-wider transition-all border border-transparent hover:bg-amber-500/10 text-amber-500 text-left"
                  >
                    <Settings className="w-5 h-5 text-amber-500" />
                    <span>⚙️ {TRANSLATIONS[language].settings}</span>
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* MAIN WORKSPACE CONTENT */}
        <main className="flex-1 p-2.5 sm:p-6 lg:p-8 flex flex-col justify-between space-y-4 sm:space-y-8 max-w-7xl mx-auto w-full">
          
          <div className="space-y-4 sm:space-y-6">
            
            {/* Brand Welcome Header Container */}
            <div className="bg-gradient-to-r from-[#211C18] to-[#3A2E26] text-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-xl shadow-amber-950/15 relative overflow-hidden border border-amber-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 animate-fade-in">
              <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none">
                <svg className="w-80 h-full text-white" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,0 L100,50 L0,100 Z" />
                </svg>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 w-full">
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="px-2 py-0.5 bg-amber-600/90 text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md text-amber-100">
                      ☀️ Ertalab (Reja) & 🌙 Kechqurun (Foyda)
                    </span>
                    <span className="text-[10px] sm:text-xs text-amber-207 text-amber-250 font-semibold flex items-center gap-1 leading-tight">
                      Bitta ixcham ekranda jamlangan mahsulot hisobi
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight font-sans">
                    Nonvoy <span className="text-amber-450 text-amber-400">Ish Daftari</span> va Kalkulyatori
                  </h2>
                  <p className="text-slate-350 text-[11px] sm:text-xs md:text-sm max-w-xl leading-relaxed font-sans font-medium">
                    Tandirxonadagi kunni oson boshlang, xamir qorishni aniq rejalashtiring va kechqurun sotilgan nonlar hisobida sof foydani daftarda doimiy to'plang.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDataReset}
                    className="px-2.5 sm:px-3.5 py-2.5 sm:py-2 border border-amber-900/30 hover:border-amber-700 bg-amber-955/40 hover:bg-amber-950/80 text-amber-300 hover:text-white rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer hover:scale-102 active:scale-98 duration-200"
                  >
                    <RefreshCw className="w-3 sm:w-3.5 sm:h-3.5 animate-spin-slow shrink-0" /> <span className="truncate">Tarixni to'chirish</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('ledger-section')}
                    className="px-3 sm:px-4 py-2.5 sm:py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#1C1613] font-black rounded-xl text-[10px] sm:text-xs shadow-md shadow-amber-900/40 hover:shadow-[0_0_18px_rgba(245,158,11,0.6)] transition-all text-center scale-100 hover:scale-[1.03] active:scale-95 duration-300 flex items-center justify-center"
                  >
                    📓 Jurnalga o'tish
                  </button>
                </div>
              </div>
            </div>

            {/* EASY ONBOARDING / WHAT-TO-DO GUIDE FOR THE USER'S BROTHER */}
            <div className={`p-4 rounded-xl border shadow-xs transition-colors ${
              theme === 'dark' ? 'bg-[#1E1916]/80 border-[#312620]' : 'bg-amber-50 border-amber-200/50'
            }`}>
              <h3 className={`text-xs font-black mb-2 flex items-center gap-2 uppercase tracking-wide ${
                theme === 'dark' ? 'text-amber-400' : 'text-amber-900'
              }`}>
                <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Ish tartibi qo'llanmasi (Qisqa ko'rsatma):
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] leading-normal font-sans font-medium">
                <div className={`p-2.5 rounded-lg border ${
                  theme === 'dark' ? 'bg-[#241D1A]/95 border-[#3E3027] text-slate-300' : 'bg-white border-amber-100 text-slate-600'
                }`}>
                  <span className="font-extrabold text-amber-500 block mb-0.5">☀️ 1. Un qopini yozing</span>
                  Qop sonini yozing, suv, tuz va drojji retsepti tezda hisoblanadi.
                </div>
                <div className={`p-2.5 rounded-lg border ${
                  theme === 'dark' ? 'bg-[#241D1A]/95 border-[#3E3027] text-slate-300' : 'bg-white border-amber-100 text-slate-600'
                }`}>
                  <span className="font-extrabold text-amber-500 block mb-0.5">🌙 2. Sotilgan nonni yozing</span>
                  Kechqurun sotilgan dona non sonini kiriting. Tizim sof foydani hisoblaydi.
                </div>
                <div className={`p-2.5 rounded-lg border ${
                  theme === 'dark' ? 'bg-[#241D1A]/95 border-[#3E3027] text-slate-300' : 'bg-white border-amber-100 text-slate-600'
                }`}>
                  <span className="font-extrabold text-amber-500 block mb-0.5">📓 3. Daftarga yozib qo'ying</span>
                  "Kunlik foydani yozish" tugmasini bosing — barcha tarix jurnalda saqlanadi.
                </div>
              </div>
            </div>

            {/* THE COMBINED COMPACT COCKPIT GRID */}
            <div className={`grid ${isSplitView ? 'grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 sm:h-[calc(100vh-140px)] overflow-visible sm:overflow-hidden items-stretch' : 'grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-start'}`}>
              
              {/* LEFT COLUMN: THE COMPACT INTEGRATED CALCULATOR (☀️ ERTALAB & 🌙 KECHQURUN) */}
              <div className={`${isSplitView ? 'sm:h-full sm:overflow-y-auto pr-0 sm:pr-2 pb-16 space-y-4' : 'lg:col-span-5 space-y-4 sm:space-y-6'}`} id="calculator-section">
                
                {/* COMPACT CARD FOR CALCULATION */}
                <div className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-xl flex flex-col justify-between transition-all ${
                  theme === 'dark' 
                    ? 'bg-[#1E1916] border-[#312620]' 
                    : 'bg-white border-slate-150'
                }`}>
                  
                  {/* Tabs to switch within the compact calc container */}
                  <div className="flex flex-col sm:flex-row gap-3 border-b border-amber-900/10 pb-4 mb-5 justify-between sm:items-center text-left">
                    <div className="flex items-center gap-1.5 animate-fade-in">
                      <span className="p-1.5 bg-amber-600 rounded-lg text-white">
                        <Calculator className="w-4 h-4" />
                      </span>
                      <span className={`text-xs font-black uppercase tracking-wider block ${
                        theme === 'dark' ? 'text-amber-400' : 'text-slate-800'
                      }`}>Bugungi Hisob-kitob</span>
                    </div>

                    <div className="flex bg-[#2E241E]/40 p-1 rounded-xl border border-amber-900/10 shrink-0 select-none self-start sm:self-auto w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setCalculatorTab('morning')}
                        className={`flex-1 sm:flex-initial text-center px-3.5 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all duration-300 cursor-pointer ${
                          calculatorTab === 'morning'
                            ? 'bg-amber-600 border-amber-500 text-white font-extrabold shadow'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        ☀️ Ertalab
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalculatorTab('evening')}
                        className={`flex-1 sm:flex-initial text-center px-3.5 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all duration-300 cursor-pointer ${
                          calculatorTab === 'evening'
                            ? 'bg-amber-600 border-amber-500 text-white font-extrabold shadow'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        🌙 Kechqurun
                      </button>
                    </div>
                  </div>

                  {/* Sub Tab: Morning (Ertalabki) */}
                  {calculatorTab === 'morning' ? (
                    <div className="space-y-4 animate-fade-in text-xs font-sans">
                      {/* Sacks Input block */}
                      <div className={`${
                        theme === 'dark' ? 'bg-[#251E1B] border-[#3E322A]' : 'bg-slate-50'
                      } border rounded-2xl p-4.5 space-y-3.5 shadow-inner`}>
                        <div className="flex items-center justify-between gap-2.5">
                          <label className={`text-[11px] font-black uppercase tracking-wider leading-tight ${
                            theme === 'dark' ? 'text-slate-300' : 'text-slate-500'
                          }`} htmlFor="compact-workflow-bags">
                            Bugun necha qop un tayyorlanadi?
                          </label>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setBagsCount(Math.max(0.5, bagsCount - 0.5))}
                              className="w-8 h-8 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-550 text-amber-500 font-extrabold text-base flex items-center justify-center transition-all cursor-pointer select-none active:scale-90"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              id="compact-workflow-bags"
                              min="0.5"
                              max="100"
                              step="0.5"
                              value={bagsCount}
                              onChange={(e) => setBagsCount(Math.max(0.1, parseFloat(e.target.value) || 0))}
                              className={`w-12 py-1.5 text-center font-black text-sm border rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                theme === 'dark' 
                                  ? 'bg-[#1C1613] text-amber-400 border-amber-500/30 font-mono' 
                                  : 'bg-white text-amber-700 border-amber-300'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setBagsCount(Math.min(100, bagsCount + 0.5))}
                              className="w-8 h-8 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-550 text-amber-500 font-extrabold text-base flex items-center justify-center transition-all cursor-pointer select-none active:scale-90"
                            >
                              +
                            </button>
                            <span className={`text-[10px] font-black shrink-0 ${
                              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                            }`}>qop</span>
                          </div>
                        </div>

                        {/* Increment buttons */}
                        <div className="grid grid-cols-5 gap-1.5">
                          {[1, 2, 3, 5, 10].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setBagsCount(num)}
                              className={`py-1.5 rounded-lg text-[9px] font-black tracking-wider transition-all border outline-none scale-100 hover:scale-[1.05] hover:shadow-[0_0_10px_rgba(245,158,11,0.5)] cursor-pointer ${
                                bagsCount === num
                                  ? 'bg-amber-600 text-white font-black border-amber-600 shadow'
                                  : theme === 'dark'
                                    ? 'bg-[#1C1613] hover:bg-[#2A211D] text-slate-300 border-transparent'
                                    : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              {num} qop
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Output metric card */}
                      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-3xl p-5 shadow-lg space-y-4">
                        <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-2.5">
                          <span className="text-[10px] font-black tracking-widest text-amber-50 uppercase block leading-none">
                            🔮 TAXMINIY NON CHIQISHI HISOBI
                          </span>
                        </div>
                        
                        {/* Row 1: The input with larger numbers and control buttons */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-extrabold text-[#1C1613] uppercase tracking-wide block" htmlFor="yield-per-bag-input">
                            1 qopdan o'rtacha necha dona non chiqadi?
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setBreadPerBag(Math.max(0, breadPerBag - 5))}
                              className="w-11 h-11 shrink-0 rounded-2xl bg-black/15 hover:bg-black/25 text-[#1C1613] font-black text-base flex items-center justify-center transition-all active:scale-90 cursor-pointer select-none"
                              title="5 taga kamaytirish"
                            >
                              -5
                            </button>
                            
                            <input
                              type="number"
                              id="yield-per-bag-input"
                              value={breadPerBag || ''}
                              onChange={(e) => setBreadPerBag(Math.max(0, parseInt(e.target.value) || 0))}
                              className="flex-1 h-11 text-center font-black text-xl bg-white text-slate-900 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-md font-mono"
                              title="Har qopdan chiqish soni"
                            />

                            <button
                              type="button"
                              onClick={() => setBreadPerBag(breadPerBag + 5)}
                              className="w-11 h-11 shrink-0 rounded-2xl bg-black/15 hover:bg-black/25 text-[#1C1613] font-black text-base flex items-center justify-center transition-all active:scale-90 cursor-pointer select-none"
                              title="5 taga ko'paytirish"
                            >
                              +5
                            </button>
                          </div>
                          
                          {/* Quick selectors for easy setting */}
                          <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2.5">
                            {[390, 395, 397, 400, 410].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setBreadPerBag(num)}
                                className={`flex-1 min-w-[50px] py-1 text-[10px] font-black rounded-lg transition-all border cursor-pointer ${
                                  breadPerBag === num
                                    ? 'bg-white text-orange-600 border-transparent shadow'
                                    : 'bg-black/10 text-white/90 border-transparent hover:bg-black/20'
                                }`}
                              >
                                {num} ta
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Row 2: Large total display banner */}
                        <div className="p-3 sm:p-4 bg-black/15 rounded-2xl flex flex-col items-center justify-center text-center border border-white/10 shadow-inner">
                          <span className="text-[9px] sm:text-[10px] font-semibold text-amber-100 uppercase tracking-wider mb-1 px-1 text-center leading-normal">
                            {bagsCount} qop un uchun JAMI TAXMINIY CHIQISH:
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white mb-0.5 drop-shadow">
                              {formatNum(expectedTotalBreads)}
                            </span>
                            <span className="text-xs font-bold text-amber-100">
                              dona
                            </span>
                          </div>
                          <span className="text-[9.5px] sm:text-[10px] font-bold text-orange-100 uppercase tracking-wide mt-1.5 text-center leading-relaxed">
                            {bagsCount} qop x {breadPerBag} non = {formatNum(expectedTotalBreads)} ta issiq non
                          </span>
                        </div>
                      </div>

                      {/* Ingredients needed box */}
                      <div className={`${
                        theme === 'dark' ? 'bg-[#251E1B] border-[#3E322A]' : 'bg-slate-50'
                      } border rounded-2xl p-4 space-y-2.5 shadow-inner`}>
                        <span className={`text-[9.5px] font-black uppercase tracking-wider block ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-505'
                        }`}>Xamir uchun kerakli masalliqlar:</span>
                        
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          {/* Flour weight */}
                          <div className={`p-2 rounded-xl border ${
                            theme === 'dark' ? 'bg-[#1C1613] border-[#3E322A]' : 'bg-white border-slate-150'
                          } shadow-sm`}>
                            <span className={`text-[8px] block font-bold uppercase tracking-wider mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-505'}`}>Jami Un</span>
                            <span className={`font-black tracking-tight ${theme === 'dark' ? 'text-amber-400' : 'text-slate-800'}`}>{(bagsCount * 50).toFixed(0)} kg</span>
                          </div>

                          {/* Water */}
                          <div className={`p-2 rounded-xl border ${
                            theme === 'dark' ? 'bg-[#1C1613] border-[#3E322A]' : 'bg-white border-slate-150'
                          } shadow-sm`}>
                            <span className={`text-[8px] block font-bold uppercase tracking-wider mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-505'}`}>Toza Suv</span>
                            <span className="font-black tracking-tight text-blue-500">{waterLiters.toFixed(1)} L</span>
                          </div>

                          {/* Salt / Drojji */}
                          <div className={`p-2 rounded-xl border ${
                            theme === 'dark' ? 'bg-[#1C1613] border-[#3E322A]' : 'bg-white border-slate-150'
                          } shadow-sm`}>
                            <span className={`text-[8px] block font-bold uppercase tracking-wider mb-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-505'}`}>Tuz & Xamir</span>
                            <span className="font-extrabold tracking-tight text-amber-600 text-[10px] block mt-0.5">
                              {(saltKg * 1000).toFixed(0)}g / {(yeastKg * 1000).toFixed(0)}g
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Sub Tab: Evening (Kechki)
                    <form onSubmit={handleSaveEveningLog} className="space-y-4 animate-fade-in text-xs font-sans">
                      {/* Custom log date */}
                      <div className="space-y-1">
                        <label className={`text-[9.5px] font-black uppercase tracking-wide leading-tight ${
                          theme === 'dark' ? 'text-slate-300' : 'text-slate-505'
                        }`} htmlFor="evening-workflow-date">
                          Sana / Kunni tanlash:
                        </label>
                        <input
                          type="date"
                          id="evening-workflow-date"
                          required
                          value={eveningDate}
                          onChange={(e) => setEveningDate(e.target.value)}
                          className={`w-full text-center border p-2 rounded-xl font-bold font-mono text-xs focus:ring-1 focus:ring-amber-500 ${
                            theme === 'dark' 
                              ? 'bg-[#1C1613] text-[#EDE8E0] border-amber-655/30' 
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        />
                      </div>

                      {/* Multi-price toggle switcher block */}
                      <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        theme === 'dark' ? 'bg-[#251E1B]/80 border-[#3E322A]' : 'bg-amber-50/40 border-amber-200/50'
                      }`}>
                        <div className="space-y-0.5">
                          <span className={`text-[10px] font-black uppercase tracking-wide block ${theme === 'dark' ? 'text-amber-400' : 'text-amber-900'}`}>
                            🧮 Turli xiil narxdagi nonlarni hisoblash
                          </span>
                          <span className="text-[9px] text-slate-400 block font-semibold leading-tight">
                            Masalan: 3000 so'mlik 100ta, 3500 so'mlik 200ta nonni alohida hisoblash
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={useMultiPrice} 
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setUseMultiPrice(checked);
                              if (checked && breadSalesList.length === 1 && breadSalesList[0].quantity === 100) {
                                // Dynamic initial buffer to avoid blank starts
                                setBreadSalesList([
                                  { id: 'b-init', name: "Standard Non", price: eveningSellingPrice, quantity: eveningSoldBreads }
                                ]);
                              }
                            }} 
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>

                      {useMultiPrice ? (
                        <div className={`space-y-3.5 p-3 rounded-2xl border ${
                          theme === 'dark' ? 'bg-[#1C1613] border-[#312620]' : 'bg-slate-50 border-slate-150'
                        } animate-fade-in`}>
                          <span className="text-[10px] font-black uppercase text-amber-500 block tracking-wider">
                            📋 Non turlari va Narxlari ro'yxati:
                          </span>

                          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                            {breadSalesList.map((item) => (
                              <div 
                                key={item.id} 
                                className={`p-2.5 rounded-xl border flex flex-col gap-2 relative ${
                                  theme === 'dark' ? 'bg-[#251E1B] border-[#312620]' : 'bg-white border-slate-200'
                                }`}
                              >
                                {/* Row Header / controls */}
                                <div className="flex items-center justify-between gap-2 border-b border-dashed border-[#312620]/20 dark:border-amber-900/10 pb-1.5">
                                  <input 
                                    type="text" 
                                    value={item.name || ''} 
                                    onChange={(e) => handleUpdateBreadSaleRow(item.id, 'name', e.target.value)}
                                    placeholder="Masalan: 3000 so'mlik non"
                                    className={`font-black text-[10.5px] bg-transparent border-b border-transparent hover:border-amber-500/30 focus:border-amber-500 focus:outline-none w-2/3 ${
                                      theme === 'dark' ? 'text-amber-300' : 'text-slate-800'
                                    }`}
                                  />
                                  {deleteRowConfirmId === item.id ? (
                                    <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-lg animate-fade-in">
                                      <span className="text-[9px] text-rose-500 font-black whitespace-nowrap uppercase">O'chirish?</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleRemoveBreadSaleRow(item.id);
                                          setDeleteRowConfirmId(null);
                                        }}
                                        className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded text-[9px] uppercase cursor-pointer"
                                      >
                                        Ha
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeleteRowConfirmId(null)}
                                        className={`px-1.5 py-0.5 font-extrabold rounded text-[9px] uppercase cursor-pointer ${
                                          theme === 'dark' ? 'bg-[#312620] text-slate-300' : 'bg-slate-200 text-slate-700'
                                        }`}
                                      >
                                        Yo'q
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setDeleteRowConfirmId(item.id)}
                                      className="p-1 hover:text-rose-500 text-slate-400 font-bold hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                                      title="O'chirish"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                {/* Inputs Row */}
                                <div className="grid grid-cols-12 gap-2 text-[10px]">
                                  {/* Price */}
                                  <div className="col-span-3 space-y-1">
                                    <span className="text-slate-400 block font-bold text-[8.5px] truncate">Narxi (so'm):</span>
                                    <input 
                                      type="number" 
                                      step="100"
                                      min="0"
                                      value={item.price || ''}
                                      onChange={(e) => handleUpdateBreadSaleRow(item.id, 'price', Math.max(0, parseInt(e.target.value) || 0))}
                                      className={`w-full py-1 px-1 rounded-lg border font-black text-center ${
                                        theme === 'dark' ? 'bg-[#1C1613] text-amber-400 border-amber-900/10 font-mono' : 'bg-slate-50 text-slate-800'
                                      }`}
                                    />
                                  </div>

                                  {/* Quantity */}
                                  <div className="col-span-3 space-y-1">
                                    <span className="text-slate-400 block font-bold text-[8.5px] truncate">Soni (ta):</span>
                                    <input 
                                      type="number" 
                                      min="0"
                                      value={item.quantity || ''}
                                      onChange={(e) => handleUpdateBreadSaleRow(item.id, 'quantity', Math.max(0, parseInt(e.target.value) || 0))}
                                      className={`w-full py-1 px-1 rounded-lg border font-black text-center ${
                                        theme === 'dark' ? 'bg-[#1C1613] text-emerald-400 border-amber-900/10 font-mono' : 'bg-slate-50 text-slate-800'
                                      }`}
                                    />
                                  </div>

                                  {/* Weight */}
                                  <div className="col-span-3 space-y-1">
                                    <span className="text-slate-400 block font-bold text-[8.5px] truncate">Vazni (g):</span>
                                    <input 
                                      type="number" 
                                      min="0"
                                      value={item.weight || ''}
                                      onChange={(e) => handleUpdateBreadSaleRow(item.id, 'weight', Math.max(0, parseInt(e.target.value) || 0))}
                                      className={`w-full py-1 px-1 rounded-lg border font-black text-center ${
                                        theme === 'dark' ? 'bg-[#1C1613] text-sky-400 border-amber-900/10 font-mono' : 'bg-slate-50 text-slate-800'
                                      }`}
                                      placeholder="450"
                                    />
                                  </div>

                                  {/* Subtotal */}
                                  <div className="col-span-3 text-right flex flex-col justify-end pb-1.5 font-sans">
                                    <span className="text-slate-500 text-[8px] font-bold block truncate">Jami:</span>
                                    <span className={`font-mono text-[9px] sm:text-[10.5px] font-black tracking-tight ${
                                      theme === 'dark' ? 'text-amber-500' : 'text-slate-700'
                                    }`}>
                                      {formatNum(Number(item.quantity || 0) * Number(item.price || 0))}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Add button */}
                          <button
                            type="button"
                            onClick={handleAddBreadSaleRow}
                            className={`w-full py-2 border border-dashed rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all scale-100 active:scale-98 cursor-pointer ${
                              theme === 'dark' 
                                ? 'border-amber-500/30 hover:bg-amber-500/10 text-amber-400 hover:border-amber-550' 
                                : 'border-amber-300 hover:bg-amber-50 text-amber-700'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            + Keyingi non turini va narxini qo'shish
                          </button>

                          {/* Dynamic multi-price Summary Box */}
                          <div className={`p-3 rounded-xl border flex justify-between gap-18 ${
                            theme === 'dark' ? 'bg-[#251E1B] border-amber-900/10' : 'bg-amber-50/50 border-amber-200/50'
                          }`}>
                            <div>
                              <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wide block leading-none mb-1">Xisoblangan Jami:</span>
                              <span className={`text-[10px] font-black block ${theme === 'dark' ? 'text-slate-350' : 'text-slate-705'}`}>
                                📦 {formatNum(breadSalesList.reduce((sum, item) => sum + Number(item.quantity || 0), 0))} dona non
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wide block leading-none mb-1">Jami Tushum (Kirim):</span>
                              <span className="text-emerald-500 text-xs sm:text-sm font-black font-mono block">
                                {formatUZS(breadSalesList.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.price || 0)), 0))}
                              </span>
                            </div>
                          </div>

                          {/* 1 qop un narxi */}
                          <div className="space-y-1">
                            <label className={`text-[9.5px] font-black block uppercase tracking-wide ${
                              theme === 'dark' ? 'text-slate-300' : 'text-slate-500'
                            }`} htmlFor="compact-fl-price">
                              1 qop un narxi bugun (so'm)
                            </label>
                            <input
                              type="number"
                              id="compact-fl-price"
                              required
                              step="5000"
                              min="0"
                              className={`w-full text-center text-xs font-black border rounded-lg p-2 focus:ring-1 focus:ring-amber-500 ${
                                theme === 'dark' 
                                  ? 'bg-[#1C1613] text-slate-200 border-amber-655/30 font-mono' 
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                              value={eveningFlourPrice}
                              onChange={(e) => setEveningFlourPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Sold breads input */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10.5px] font-bold">
                              <label className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} uppercase tracking-wide font-black`} htmlFor="compact-sold-count">
                                Bugun nechta non sotildi? (dona)
                              </label>
                              <span className="text-slate-505 bg-[#2A211D] font-mono px-2 py-0.5 rounded text-[8.5px] font-black border border-amber-550/20">
                                Taxminiy reja: ~{expectedTotalBreads} ta
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <button
                                type="button"
                                onClick={() => setEveningSoldBreads(Math.max(0, eveningSoldBreads - 50))}
                                className="px-2 py-3 text-[10px] font-black rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 cursor-pointer active:scale-90 transition-all text-center flex-1"
                                title="50 ta kamaytirish"
                              >
                                -50
                              </button>
                              <button
                                type="button"
                                onClick={() => setEveningSoldBreads(Math.max(0, eveningSoldBreads - 5))}
                                className="px-2 py-3 text-[10px] font-black rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 cursor-pointer active:scale-95 transition-all text-center flex-1"
                                title="5 ta kamaytirish"
                              >
                                -5
                              </button>
                              <input
                                type="number"
                                id="compact-sold-count"
                                required
                                min="0"
                                className={`w-28 text-center border rounded-xl p-2.5 font-black text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                                  theme === 'dark' 
                                    ? 'bg-[#1C1613] text-amber-400 border-amber-500/30 font-mono' 
                                    : 'bg-[#FDFDFD] text-slate-800 border-slate-200 shadow-inner'
                                }`}
                                value={eveningSoldBreads}
                                onChange={(e) => setEveningSoldBreads(Math.max(0, parseInt(e.target.value) || 0))}
                              />
                              <button
                                type="button"
                                onClick={() => setEveningSoldBreads(eveningSoldBreads + 5)}
                                className="px-2 py-3 text-[10px] font-black rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 cursor-pointer active:scale-95 transition-all text-center flex-1"
                                title="5 ta qo'shish"
                              >
                                +5
                              </button>
                              <button
                                type="button"
                                onClick={() => setEveningSoldBreads(eveningSoldBreads + 50)}
                                className="px-2 py-3 text-[10px] font-black rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-555 cursor-pointer active:scale-90 transition-all text-center flex-1"
                                title="50 ta qo'shish"
                              >
                                +50
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3.5">
                            {/* Selling Price input */}
                            <div className="space-y-1">
                              <label className={`text-[9.5px] font-black block uppercase tracking-wide ${
                                theme === 'dark' ? 'text-slate-300' : 'text-slate-505'
                              }`} htmlFor="compact-sell-price">
                                Sotish narxi (so'm)
                              </label>
                              <input
                                type="number"
                                id="compact-sell-price"
                                required
                                step="100"
                                min="0"
                                className={`w-full text-center text-xs font-black border rounded-lg p-2 focus:ring-1 focus:ring-amber-500 ${
                                  theme === 'dark' 
                                    ? 'bg-[#1C1613] text-amber-500 border-amber-655/30' 
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                                value={eveningSellingPrice}
                                onChange={(e) => setEveningSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                              />
                            </div>

                            {/* Flour price */}
                            <div className="space-y-1">
                              <label className={`text-[9.5px] font-black block uppercase tracking-wide ${
                                theme === 'dark' ? 'text-slate-300' : 'text-slate-505'
                              }`} htmlFor="compact-fl-price">
                                1 qop un narxi bugun (so'm)
                              </label>
                              <input
                                type="number"
                                id="compact-fl-price"
                                required
                                step="5000"
                                min="0"
                                className={`w-full text-center text-xs font-black border rounded-lg p-2 focus:ring-1 focus:ring-amber-500 ${
                                  theme === 'dark' 
                                    ? 'bg-[#1C1613] text-slate-200 border-amber-655/30 font-mono' 
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                                value={eveningFlourPrice}
                                onChange={(e) => setEveningFlourPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Damaged / notes */}
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className={`text-[9.5px] font-black block uppercase tracking-wide ${
                            theme === 'dark' ? 'text-slate-300' : 'text-slate-505'
                          }`} htmlFor="compact-damaged-count">
                            Zarar (singan nonlar)
                          </label>
                          <div className="flex items-center gap-1 mt-1">
                            <button
                              type="button"
                              onClick={() => setEveningDamagedBreads(Math.max(0, eveningDamagedBreads - 1))}
                              className="w-8 h-8 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-extrabold text-base flex items-center justify-center transition-all cursor-pointer select-none active:scale-95"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              id="compact-damaged-count"
                              required
                              min="0"
                              className={`flex-1 py-1.5 text-center text-xs font-black border rounded-lg focus:ring-1 focus:ring-amber-500 ${
                                theme === 'dark' 
                                  ? 'bg-[#1C1613] text-amber-400 border-amber-500/30 font-mono' 
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                              value={eveningDamagedBreads}
                              onChange={(e) => setEveningDamagedBreads(Math.max(0, parseInt(e.target.value) || 0))}
                            />
                            <button
                              type="button"
                              onClick={() => setEveningDamagedBreads(eveningDamagedBreads + 1)}
                              className="w-8 h-8 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-extrabold text-base flex items-center justify-center transition-all cursor-pointer select-none active:scale-95"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className={`p-2 border rounded-xl flex flex-col justify-center text-[10px] font-bold ${
                          theme === 'dark' ? 'bg-amber-950/20 border-amber-500/10' : 'bg-amber-50/50 border-amber-200/50'
                        }`}>
                          <span className="text-slate-500 text-[8px] uppercase tracking-wide block mb-0.5">Xarajatlar (Unsiz):</span>
                          <span className={`font-mono text-xs block ${theme === 'dark' ? 'text-amber-400' : 'text-slate-700'}`}>
                            {formatUZS((bagsCount * unitExpensesPerBag) + fixedExpensesDaily)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className={`text-[9px] font-black block uppercase tracking-wide ${
                          theme === 'dark' ? 'text-slate-300' : 'text-slate-505'
                        }`} htmlFor="compact-note">
                          Eslatma yoki belgi:
                        </label>
                        <input
                          type="text"
                          id="compact-note"
                          placeholder="masalan: bugungi un juda sifatli ekan"
                          className={`w-full text-xs p-2 border rounded-xl focus:ring-1 focus:ring-amber-500 ${
                            theme === 'dark' 
                              ? 'bg-[#1C1613] text-[#EDE8E0] border-amber-655/20 placeholder-slate-600' 
                              : 'bg-slate-50 border-slate-200 placeholder-slate-400'
                          }`}
                          value={eveningNote}
                          onChange={(e) => setEveningNote(e.target.value)}
                        />
                      </div>

                      {/* Solid Gold button with glow and scale transition */}
                      <button
                        type="submit"
                        id="save-compact-log-btn"
                        className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-750 text-[#1C1613] font-black text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_25px_rgba(245,158,11,0.7)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 border border-amber-450/40 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        📝 Kunning Foydasini Jurnalga Yozish
                        <ArrowRight className="w-3.5 h-3.5 animate-bounce" />
                      </button>
                    </form>
                  )}
                </div>

                {/* QUICK USAGE GUIDE CARD IN LEFT COL */}
                <div className={`${
                  theme === 'dark' ? 'bg-[#1e1916]/85 border-[#3E322A]' : 'bg-amber-50/50 border-amber-200/50'
                } border rounded-2xl p-4.5 space-y-2 shadow-inner text-xs`}>
                  <span className="font-extrabold text-amber-653 block mb-1">💡 Yo'riq qatnovi:</span>
                  <p className="text-slate-400 leading-relaxed font-semibold">
                    Ertalab <strong className="text-amber-500 font-bold">☀️ Ertalab</strong> panelida tayyorlanadigan qopni belgilang. Kechqurun <strong className="text-amber-500 font-bold">🌙 Kechqurun</strong> panelida sotilgan nonlar sonini kiritib daftarni yuritishni bosing! Hammasi bitta umumiy ekranda o'zgacha qutilarda joylashdi.
                  </p>
                </div>

              </div>

              {/* RIGHT COLUMN: THE LEDGER REGISTER AND STATS (📓 SHAXSIY DAFTAR) */}
              <div className={`${isSplitView ? 'sm:h-full sm:overflow-y-auto pr-0 sm:pr-2 pb-16' : 'lg:col-span-7'}`} id="ledger-section">
                {/* Ledger component contains complete statistics dashboard and tables */}
                <Ledger
                  logs={logs}
                  setLogs={setLogs}
                  onAddLog={handleAddLog}
                  currentBags={bagsCount}
                  currentYield={breadPerBag}
                  currentFlourPrice={flourPrice}
                  currentSellingPrice={sellingPrice}
                  calculatedVariableExpenses={unitExpensesPerBag * bagsCount}
                  calculatedFixedExpenses={fixedExpensesDaily}
                  theme={theme}
                />
              </div>

            </div>

            {/* INTEGRATE DETAILED HISTORY TIMELINE COMPONENT FOR ALL PERSISTED LOGS (DURABLE CLOUD-STYLE LOCAL) */}
            <div id="history-timeline" className="scroll-mt-20">
              <HistoryTimeline 
                logs={logs}
                setLogs={setLogs}
                theme={theme}
              />
            </div>

          </div>

          {/* Traditional wisdom folklore card & Footer */}
          <div className="space-y-8 pt-8 border-t border-[#312620]/20">
            
            {/* Folklore quote */}
            <div className={`border rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-5 shadow-sm ${
              theme === 'dark' ? 'bg-[#1E1916]/40 border-[#312620]' : 'bg-gradient-to-r from-amber-50 to-amber-100/30 border-amber-200/50'
            }`}>
              <div className="p-3.5 bg-amber-100 text-amber-800 rounded-2xl shrink-0 border border-amber-200">
                <Award className="w-8 h-8 text-amber-600" />
              </div>
              <div className="space-y-1">
                <h3 className={`text-sm font-bold font-sans ${theme === 'dark' ? 'text-amber-400' : 'text-amber-950'}`}>
                  Nonvoylik sirlari: "Nonni issig'ida ushlamasangiz, uvoli uradi" 🌾
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                  O'zbek xonadonlarining asosi bulgan tandir nonlarining tannarxini hisoblash juda nozik jarayon hisoblanadi. Noningiz qarsildoq, suv nisbati muvofiq, olov quvvati teng tushsa, hosildorlik darajasi har doim yuqori bo'ladi. Jurnal yordamida uningizning haqiqiy baha va foyda nisbatini doim belgilasangiz baraka topasiz!
                </p>
              </div>
            </div>

            {/* Simple footer */}
            <footer className="text-center text-slate-400 text-[11px] leading-relaxed py-4 border-t border-slate-100">
              <p>© 2026 Nonvoy Kalkulyatori Integrali. Barcha huquqlar himoyalangan.</p>
              <p className="mt-1 font-semibold text-amber-600">Akajonim uchun mukammal tandirxonada foyda hisob jurnali.</p>
            </footer>

          </div>

        </main>

      </div>

      {/* COMPREHENSIVE SETTINGS DIALOG (MODAL OVERLAY) */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          {/* Glass background overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity cursor-pointer duration-300"
            onClick={() => setIsSettingsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className={`relative w-full max-w-2xl rounded-3xl overflow-hidden border shadow-2xl transition-all transform scale-100 hover:scale-[1.01] duration-300 z-10 flex flex-col ${
            theme === 'dark' 
              ? 'bg-[#1E1916] text-[#EDE8E0] border-[#312620]' 
              : 'bg-[#FCFAF7] text-[#3E2E26] border-amber-200/40'
          }`}>
            {/* Modal Header */}
            <div className="p-6 border-b border-amber-900/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  {TRANSLATIONS[language].settingsTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {TRANSLATIONS[language].settingsDesc}
                </p>
              </div>
              <button 
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1 px-3 border border-amber-500/20 hover:border-amber-500/60 rounded-xl text-slate-400 hover:text-amber-500 text-sm transition-all cursor-pointer font-bold leading-none py-2"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs Row */}
            <div className="flex border-b border-amber-900/10 p-2 gap-1 bg-amber-500/5 flex-wrap">
              <button
                type="button"
                onClick={() => setSettingsTab('bg')}
                className={`flex-1 min-w-[80px] py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  settingsTab === 'bg'
                    ? 'bg-amber-500 text-[#1C1613] shadow-md'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-amber-500/5'
                }`}
              >
                {TRANSLATIONS[language].tabBg}
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab('font')}
                className={`flex-1 min-w-[80px] py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  settingsTab === 'font'
                    ? 'bg-amber-500 text-[#1C1613] shadow-md'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-amber-500/5'
                }`}
              >
                {TRANSLATIONS[language].tabFont}
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab('lang')}
                className={`flex-1 min-w-[80px] py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  settingsTab === 'lang'
                    ? 'bg-amber-500 text-[#1C1613] shadow-md'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-amber-500/5'
                }`}
              >
                {TRANSLATIONS[language].tabLang}
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab('bread')}
                className={`flex-1 min-w-[80px] py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  settingsTab === 'bread'
                    ? 'bg-amber-500 text-[#1C1613] shadow-md'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-amber-500/5'
                }`}
              >
                {TRANSLATIONS[language].tabBread}
              </button>
            </div>

            {/* Modal Body Scroll Container */}
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              {settingsTab === 'bg' && (
                <div className="space-y-6">
                  {/* Selector Switcher for BG Type */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                      {TRANSLATIONS[language].bgType}
                    </span>
                    <div className="grid grid-cols-2 gap-2 bg-amber-500/5 p-1 rounded-xl border border-amber-500/10">
                      <button
                        type="button"
                        onClick={() => setBgType('gradient')}
                        className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                          bgType === 'gradient'
                            ? 'bg-amber-500 text-[#1C1613] shadow-md'
                            : 'text-slate-400'
                        }`}
                      >
                        {TRANSLATIONS[language].bgGradients}
                      </button>
                      <button
                        type="button"
                        onClick={() => setBgType('image')}
                        className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                          bgType === 'image'
                            ? 'bg-amber-500 text-[#1C1613] shadow-md'
                            : 'text-slate-400'
                        }`}
                      >
                        {TRANSLATIONS[language].bgImages}
                      </button>
                    </div>
                  </div>

                  {bgType === 'gradient' ? (
                    /* Preset Gradients Selection Grid */
                    <div className="space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                        {TRANSLATIONS[language].bgSelectGradient}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {PRESET_GRADIENTS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setBgPreset(p.id)}
                            className={`p-3 rounded-2xl cursor-pointer relative flex flex-col items-center justify-center gap-2 transition-all border text-center ${p.style} ${
                              bgPreset === p.id 
                                ? 'ring-4 ring-amber-500 border-white scale-105 shadow-lg' 
                                : 'border-black/15 opacity-80 hover:opacity-100 hover:scale-102'
                            }`}
                          >
                            <span className="text-white text-xs font-black drop-shadow shadow-black/40">
                              {p.label.split(' ')[0]}
                            </span>
                            <span className="text-[10px] text-white font-bold tracking-tight bg-black/30 px-1.5 py-0.5 rounded leading-none">
                              {p.label.split(' ').slice(1).join(' ')}
                            </span>
                            {bgPreset === p.id && (
                              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-white shadow flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Base64 Custom Image Upload */
                    <div className="space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                        {TRANSLATIONS[language].bgCustomLoad}
                      </span>
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                        <label className="p-4 px-6 bg-gradient-to-r from-amber-600 to-amber-550 text-[#1C1613] font-black text-xs uppercase tracking-widest rounded-2xl cursor-pointer text-center flex items-center gap-2 transition-all shadow-md active:scale-95 duration-200">
                          <span>{TRANSLATIONS[language].bgCustomBtn}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const base64 = event.target?.result as string;
                                  setBgCustomImage(base64);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>

                        {bgCustomImage ? (
                          <div className="flex items-center gap-3 bg-black/10 p-2 px-3 rounded-2xl border border-amber-500/15 max-w-full">
                            <img src={bgCustomImage} alt="thumbnail" className="w-14 h-14 rounded-xl object-cover border border-amber-500/20 shadow-inner" referrerPolicy="no-referrer" />
                            <div className="space-y-1 text-left">
                              <span className="text-xs font-bold text-amber-500 block">
                                Rasm yuklandi
                              </span>
                              {deleteCustomBgConfirm ? (
                                <div className="flex items-center gap-1.5 p-1 bg-rose-500/10 border border-rose-500/20 rounded-xl select-none">
                                  <span className="text-[9px] text-rose-400 font-extrabold uppercase px-1">Ishonchingiz komilmi?</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setBgCustomImage(null);
                                      setDeleteCustomBgConfirm(false);
                                    }}
                                    className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-lg text-[9px] uppercase cursor-pointer"
                                  >
                                    Ha
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteCustomBgConfirm(false)}
                                    className="px-2 py-1 bg-[#2a221e] hover:bg-[#342924] text-slate-350 font-black rounded-lg text-[9px] uppercase cursor-pointer"
                                  >
                                    Yo'q
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeleteCustomBgConfirm(true)}
                                  className="text-[10px] uppercase font-black text-rose-400 hover:text-white bg-rose-950/20 px-3 py-1 rounded-lg cursor-pointer transition-colors border border-rose-500/15"
                                >
                                  {TRANSLATIONS[language].bgCustomDelete}
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs italic text-slate-500 block">
                            {TRANSLATIONS[language].bgNoImage}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sliders for Opacity Dimming and Backdrop Blurring */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-amber-500/10">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-amber-500">
                        <span>{TRANSLATIONS[language].dimPct}</span>
                        <span className="font-mono text-amber-500">{bgOverlayOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="95"
                        value={bgOverlayOpacity}
                        onChange={(e) => setBgOverlayOpacity(parseInt(e.target.value))}
                        className="w-full accent-amber-500 h-2 cursor-pointer bg-slate-300 rounded-lg appearance-auto"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-amber-500">
                        <span>{TRANSLATIONS[language].blurLevel}</span>
                        <span className="font-mono text-amber-500">{bgBlur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="15"
                        value={bgBlur}
                        onChange={(e) => setBgBlur(parseInt(e.target.value))}
                        className="w-full accent-amber-500 h-2 cursor-pointer bg-slate-300 rounded-lg appearance-auto"
                      />
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'font' && (
                <div className="space-y-4 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                    {TRANSLATIONS[language].fontSelect}
                  </span>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'font-inter', name: 'Inter (Sans-Serif)', family: 'font-sans', desc: 'Zamonaviy va juda aniq, standart dizayn.' },
                      { id: 'font-outfit', name: 'Outfit (Silliq va Dumaloq)', family: 'font-outfit', desc: 'Geometrik yumshoq shrift, o\'ta zamonaviy interfeys uchun.' },
                      { id: 'font-mono', name: 'JetBrains Mono (Dasturlash / Texnik)', family: 'font-mono', desc: 'Sonlar va so\'zlar aniq monoxrom ko\'rinadi.' },
                      { id: 'font-serif', name: 'Lora (Nazoratli Klassik)', family: 'font-serif', desc: 'Klassik va kitobiy yozuv uslubi, tarixiy hisli.' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setActiveFont(f.id)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                          activeFont === f.id
                            ? 'bg-amber-500/10 border-amber-500 text-amber-500 scale-102 ring-2 ring-amber-500/30'
                            : 'border-amber-500/15 hover:border-amber-500/30 bg-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`${f.family} text-sm font-black`}>
                            {f.name}
                          </span>
                          {activeFont === f.id && <span className="bg-amber-500 text-[#1C1613] text-[9px] font-black uppercase px-2 py-0.5 rounded-lg">{TRANSLATIONS[language].activeLabel}</span>}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {f.desc}
                        </p>
                        
                        {/* Sample preview */}
                        <div className={`mt-3 p-2 bg-black/15 rounded-xl border border-amber-500/10 text-xs ${f.family} text-center`}>
                          1,000,000 UZS / 395 Non - 12 Bags Un
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {settingsTab === 'lang' && (
                <div className="space-y-4 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                    {TRANSLATIONS[language].langSelect}
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { id: 'uz', label: 'O\'zbekcha 🇺🇿', desc: 'Tizimning to\'liq o\'zbek tilidagi qulay interfeysi.', welcome: 'Xush kelibsiz!' },
                      { id: 'en', label: 'English 🇬🇧', desc: 'Complete system in international English vocabulary.', welcome: 'Welcome!' },
                      { id: 'ru', label: 'Русский 🇷🇺', desc: 'Русскоязычное оформление журнала и калькулятора.', welcome: 'Добро пожаловать!' }
                    ].map((langItem) => (
                      <button
                        key={langItem.id}
                        type="button"
                        onClick={() => setLanguage(langItem.id as any)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                          language === langItem.id
                            ? 'bg-amber-500/10 border-amber-500 text-amber-500 scale-102 ring-2 ring-amber-500/30'
                            : 'border-amber-500/15 hover:border-amber-500/30 bg-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black">{langItem.label}</span>
                          {language === langItem.id && <span className="bg-amber-500 text-[#1C1613] text-[9px] font-black uppercase px-2 py-0.5 rounded-lg">{TRANSLATIONS[language].activeLabel}</span>}
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                          {langItem.desc}
                        </p>
                        <div className="text-[10px] italic text-amber-400 mt-2 font-black">
                          {langItem.welcome}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {settingsTab === 'bread' && (
                <div className="space-y-4 text-left">
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4">
                    <span className="text-sm font-black text-amber-500 block mb-1">
                      {TRANSLATIONS[language].breadPresetTitle}
                    </span>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {TRANSLATIONS[language].breadPresetDesc}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {defaultBreadPresets.map((preset, idx) => (
                      <div 
                        key={preset.id || idx}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-black/15 raw-dark-card rounded-2xl border border-amber-500/5 hover:border-amber-500/15 transition-all"
                      >
                        {/* Name input */}
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] uppercase font-black text-slate-400 block">
                            {TRANSLATIONS[language].breadNameHeader}
                          </label>
                          <input
                            type="text"
                            value={preset.name}
                            onChange={(e) => handleUpdatePreset(preset.id, 'name', e.target.value)}
                            className="w-full bg-[#1C1613] text-white border border-amber-500/10 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500"
                            placeholder="Masalan: Patar non"
                          />
                        </div>

                        {/* Price input */}
                        <div className="w-full sm:w-36 space-y-1">
                          <label className="text-[10px] uppercase font-black text-slate-400 block">
                            {TRANSLATIONS[language].breadPriceHeader}
                          </label>
                          <input
                            type="number"
                            value={preset.price || ''}
                            onChange={(e) => handleUpdatePreset(preset.id, 'price', Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full bg-[#1C1613] text-white border border-amber-500/10 rounded-xl px-3 py-2 text-xs font-mono font-black focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Weight input */}
                        <div className="w-full sm:w-28 space-y-1">
                          <label className="text-[10px] uppercase font-black text-slate-400 block">
                            {TRANSLATIONS[language].breadWeightHeader}
                          </label>
                          <input
                            type="number"
                            value={preset.weight || ''}
                            onChange={(e) => handleUpdatePreset(preset.id, 'weight', Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full bg-[#1C1613] text-white border border-amber-500/10 rounded-xl px-3 py-2 text-xs font-mono font-black focus:outline-none focus:border-amber-500"
                            placeholder="450"
                          />
                        </div>

                        {/* Delete button */}
                        <div className="sm:self-end pt-1 shrink-0">
                          {deletePresetConfirmId === preset.id ? (
                            <div className="flex items-center gap-1.5 p-1 bg-rose-500/10 border border-rose-500/20 rounded-xl select-none">
                              <span className="text-[10px] text-rose-400 font-extrabold uppercase px-1">O'chirilsinmi?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  handleRemovePreset(preset.id);
                                  setDeletePresetConfirmId(null);
                                }}
                                className="px-2 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-lg text-[10px] uppercase cursor-pointer"
                              >
                                Ha
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletePresetConfirmId(null)}
                                className="px-2 py-1.5 bg-[#2a221e] hover:bg-[#342924] text-slate-300 font-black rounded-lg text-[10px] uppercase cursor-pointer"
                              >
                                Yo'q
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletePresetConfirmId(preset.id)}
                              className="w-full sm:w-10 h-10 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-400 hover:text-white rounded-xl transition-all cursor-pointer font-black text-sm active:scale-95"
                              title="O'chirish"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddPreset}
                    className="w-full py-3 bg-amber-500/5 hover:bg-amber-500/15 border border-dashed border-amber-500/30 hover:border-amber-500/60 rounded-2xl text-amber-500 font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer text-center active:scale-99"
                  >
                    {TRANSLATIONS[language].addPresetBtn}
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-amber-900/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#1C1613] font-black tracking-wider uppercase text-xs rounded-xl transition-all text-center hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] cursor-pointer"
              >
                {TRANSLATIONS[language].saveClose}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YANGI NON TURINI QO'SHISH MODAL OYNASI (POPUP DIALOG) */}
      {isBreadAddModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          {/* Glass background overlay */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity cursor-pointer duration-300"
            onClick={() => setIsBreadAddModalOpen(false)}
          />

          {/* Modal Container */}
          <div className={`relative w-full max-w-md rounded-3xl overflow-hidden border shadow-2xl transition-all transform scale-100 duration-300 z-10 flex flex-col ${
            theme === 'dark' 
              ? 'bg-[#1E1916] text-[#EDE8E0] border-[#312620]' 
              : 'bg-[#FCFAF7] text-[#3E2E26] border-amber-200/40'
          }`}>
            {/* Modal Header */}
            <div className="p-5 border-b border-amber-900/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                  🍞 Yangi Non Turini Qo'shish
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Sotilgan non turini, narxini va sonini kiritib qatorga qo'shing.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsBreadAddModalOpen(false)}
                className="p-1 px-2.5 border border-amber-500/15 hover:border-amber-500/40 rounded-xl text-slate-450 hover:text-amber-500 text-xs transition-all cursor-pointer font-bold leading-none py-1.5"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!modalBreadName.trim()) {
                alert("Iltimos, non turi nomini kiriting!");
                return;
              }
              const newRow: BreadSaleItem = {
                id: 'b-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                name: modalBreadName.trim(),
                price: Number(modalBreadPrice || 0),
                quantity: Number(modalBreadQty || 0),
                weight: Number(modalBreadWeight || 450)
              };
              setBreadSalesList(prev => [...prev, newRow]);
              setIsBreadAddModalOpen(false);
            }} className="p-5 space-y-4">
              
              {/* Preset Quick Chooser */}
              {defaultBreadPresets.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-amber-550 block tracking-wider text-amber-500">
                    ⚡️ TAYYOR SHABLONLAR (TEZKOR TANLASH):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {defaultBreadPresets.map((preset) => {
                      const isSelected = modalBreadName.trim().toLowerCase() === preset.name.trim().toLowerCase() && Number(modalBreadPrice) === Number(preset.price);
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setModalBreadName(preset.name || '');
                            setModalBreadPrice(preset.price);
                            setModalBreadWeight(preset.weight || 450);
                          }}
                          className={`text-[9.5px] px-2.5 py-1 rounded-xl font-black border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-amber-500 text-[#1C1613] border-amber-500 shadow-md font-black' 
                              : theme === 'dark'
                                ? 'bg-black/25 text-slate-300 border-amber-500/10 hover:bg-black/40 hover:border-amber-500/30'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          {preset.name} ({preset.weight || 450}g - {formatNum(preset.price)} sm)
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bread Name Input */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block" htmlFor="modal-bread-name">
                  Non turi nomi:
                </label>
                <input
                  type="text"
                  id="modal-bread-name"
                  value={modalBreadName}
                  onChange={(e) => setModalBreadName(e.target.value)}
                  className="w-full bg-[#1C1613] text-white border border-amber-500/15 focus:border-amber-500 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                  placeholder="Masalan: Patar non..."
                  required
                />
              </div>

              {/* Price, Quantity & Weight Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-left">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block" htmlFor="modal-bread-price">
                    Narxi (so'm):
                  </label>
                  <input
                    type="number"
                    id="modal-bread-price"
                    value={modalBreadPrice || ''}
                    onChange={(e) => setModalBreadPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#1C1613] text-white border border-amber-500/15 focus:border-amber-500 rounded-xl px-2.5 py-2 text-xs font-mono font-black focus:outline-none"
                    placeholder="3000"
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block" htmlFor="modal-bread-qty">
                    Soni (ta):
                  </label>
                  <input
                    type="number"
                    id="modal-bread-qty"
                    value={modalBreadQty || ''}
                    onChange={(e) => setModalBreadQty(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#1C1613] text-white border border-amber-500/15 focus:border-amber-500 rounded-xl px-2.5 py-2 text-xs font-mono font-black focus:outline-none"
                    placeholder="100"
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block" htmlFor="modal-bread-weight">
                    Vazni (g):
                  </label>
                  <input
                    type="number"
                    id="modal-bread-weight"
                    value={modalBreadWeight || ''}
                    onChange={(e) => setModalBreadWeight(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#1C1613] text-white border border-amber-500/15 focus:border-amber-500 rounded-xl px-2.5 py-2 text-xs font-mono font-black focus:outline-none"
                    placeholder="450"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Quantity quick control pads */}
              <div className="flex justify-between items-center bg-black/10 rounded-xl p-1.5 gap-1.5">
                <button
                  type="button"
                  onClick={() => setModalBreadQty(Math.max(0, modalBreadQty - 50))}
                  className="flex-1 py-1 text-[9px] font-bold text-slate-400 hover:text-white bg-black/25 hover:bg-black/45 rounded-lg transition-all cursor-pointer"
                >
                  -50 ta
                </button>
                <button
                  type="button"
                  onClick={() => setModalBreadQty(Math.max(0, modalBreadQty - 10))}
                  className="flex-1 py-1 text-[9px] font-bold text-slate-400 hover:text-white bg-black/25 hover:bg-black/45 rounded-lg transition-all cursor-pointer"
                >
                  -10 ta
                </button>
                <button
                  type="button"
                  onClick={() => setModalBreadQty(modalBreadQty + 10)}
                  className="flex-1 py-1 text-[9px] font-bold text-slate-400 hover:text-white bg-black/25 hover:bg-black/45 rounded-lg transition-all cursor-pointer"
                >
                  +10 ta
                </button>
                <button
                  type="button"
                  onClick={() => setModalBreadQty(modalBreadQty + 50)}
                  className="flex-1 py-1 text-[9px] font-bold text-slate-400 hover:text-white bg-black/25 hover:bg-black/45 rounded-lg transition-all cursor-pointer"
                >
                  +50 ta
                </button>
              </div>

              {/* Footer controls */}
              <div className="pt-3 border-t border-amber-900/10 flex items-center justify-between gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsModalOpen(true);
                    setSettingsTab('bread');
                    setIsBreadAddModalOpen(false);
                  }}
                  className="text-[9.5px] font-extrabold text-[#74C3B1] hover:text-emerald-450 hover:underline cursor-pointer"
                >
                  ⚙️ Standart turlarni tahrirlash
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBreadAddModalOpen(false)}
                    className="py-1.5 px-3 bg-transparent border border-amber-500/10 hover:border-amber-500/30 text-slate-400 hover:text-slate-200 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="py-1.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white hover:shadow-[0_0_10px_rgba(245,158,11,0.3)] text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer"
                  >
                    Qo'shish
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
