export const mockDemoResult = {
  agentA: {
    reportDate: "۱۴۰۳/۰۷/۱۸",
    factoryName: "صنایع متالورژی و قطعه‌سازی پیشگام البرز (واحد پرس‌کاری)",
    shiftSupervisor: "مهندس علیرضا سلیمانی (شیفت صبح)",
    items: [
      {
        rowNumber: 1,
        productName: "پوسته پمپ هیدرولیک تیپ A-20",
        rawMaterialUsed: 620,
        totalProduced: 600,
        wasteCount: 25,
        netProduced: 575,
        hasHandwritingStrike: false
      },
      {
        rowNumber: 2,
        productName: "شفت گیربکس صنعتی ۶ دنده",
        rawMaterialUsed: 430,
        totalProduced: 420,
        wasteCount: 18, // Agent A read 18
        netProduced: 402,
        hasHandwritingStrike: true
      },
      {
        rowNumber: 3,
        productName: "بوش برنجی خودران دینام 4KW",
        rawMaterialUsed: 850,
        totalProduced: 820,
        wasteCount: 40,
        netProduced: 790, // Human math error on paper: 820 - 40 is 780, paper wrote 790
        hasHandwritingStrike: false
      },
      {
        rowNumber: 4,
        productName: "فلنج رابط چدنی قطر ۱۲۰mm",
        rawMaterialUsed: 310,
        totalProduced: 300,
        wasteCount: 12,
        netProduced: 288,
        hasHandwritingStrike: false
      },
      {
        rowNumber: 5,
        productName: "یاتاقان کاسه‌ای فولادی سری V",
        rawMaterialUsed: 550,
        totalProduced: 540,
        wasteCount: 30, // Agent A read 30
        netProduced: 510,
        hasHandwritingStrike: true
      }
    ],
    summary: {
      totalProductionSum: 2680,
      totalWasteSum: 125,
      totalNetSum: 2565
    }
  },
  agentB: {
    reportDate: "۱۴۰۳/۰۷/۱۸",
    factoryName: "صنایع متالورژی و قطعه‌سازی پیشگام البرز - خط پرس ۳",
    shiftSupervisor: "مهندس ع. سلیمانی",
    items: [
      {
        rowNumber: 1,
        productName: "پوسته پمپ هیدرولیک تیپ A-20",
        rawMaterialUsed: 620,
        totalProduced: 600,
        wasteCount: 25,
        netProduced: 575,
        hasHandwritingStrike: false
      },
      {
        rowNumber: 2,
        productName: "شفت گیربکس صنعتی ۶ دنده",
        rawMaterialUsed: 430,
        totalProduced: 420,
        wasteCount: 13, // Agent B read 13 due to strike-through over 8/3
        netProduced: 407,
        hasHandwritingStrike: true
      },
      {
        rowNumber: 3,
        productName: "بوش برنجی خودران دینام 4KW",
        rawMaterialUsed: 850,
        totalProduced: 820,
        wasteCount: 40,
        netProduced: 790, // Also read paper literal
        hasHandwritingStrike: false
      },
      {
        rowNumber: 4,
        productName: "فلنج رابط چدنی قطر ۱۲۰mm",
        rawMaterialUsed: 310,
        totalProduced: 300,
        wasteCount: 12,
        netProduced: 288,
        hasHandwritingStrike: false
      },
      {
        rowNumber: 5,
        productName: "یاتاقان کاسه‌ای فولادی سری V",
        rawMaterialUsed: 550,
        totalProduced: 540,
        wasteCount: 35, // Agent B read 35 due to ink smudge on zero
        netProduced: 505,
        hasHandwritingStrike: true
      }
    ],
    summary: {
      totalProductionSum: 2680,
      totalWasteSum: 125,
      totalNetSum: 2565
    }
  },
  judge: {
    finalVerifiedData: {
      reportDate: "۱۴۰۳/۰۷/۱۸",
      factoryName: "صنایع متالورژی و قطعه‌سازی پیشگام البرز (واحد پرس‌کاری)",
      shiftSupervisor: "مهندس علیرضا سلیمانی",
      items: [
        {
          rowNumber: 1,
          productName: "پوسته پمپ هیدرولیک تیپ A-20",
          rawMaterialUsed: 620,
          totalProduced: 600,
          wasteCount: 25,
          netProduced: 575,
          hasHandwritingStrike: false,
          status: "verified"
        },
        {
          rowNumber: 2,
          productName: "شفت گیربکس صنعتی ۶ دنده",
          rawMaterialUsed: 430,
          totalProduced: 420,
          wasteCount: 18,
          netProduced: 402,
          hasHandwritingStrike: true,
          status: "resolved_strike"
        },
        {
          rowNumber: 3,
          productName: "بوش برنجی خودران دینام 4KW",
          rawMaterialUsed: 850,
          totalProduced: 820,
          wasteCount: 40,
          netProduced: 780, // Corrected from 790
          hasHandwritingStrike: false,
          status: "math_corrected"
        },
        {
          rowNumber: 4,
          productName: "فلنج رابط چدنی قطر ۱۲۰mm",
          rawMaterialUsed: 310,
          totalProduced: 300,
          wasteCount: 12,
          netProduced: 288,
          hasHandwritingStrike: false,
          status: "verified"
        },
        {
          rowNumber: 5,
          productName: "یاتاقان کاسه‌ای فولادی سری V",
          rawMaterialUsed: 550,
          totalProduced: 540,
          wasteCount: 30,
          netProduced: 510,
          hasHandwritingStrike: true,
          status: "resolved_strike"
        }
      ],
      summary: {
        totalProductionSum: 2680,
        totalWasteSum: 125,
        totalNetSum: 2555
      }
    },
    differencesFound: [
      {
        field: "ردیف ۲ - ستون ضایعات (Waste Count)",
        agentAValue: "۱۸ عدد",
        agentBValue: "۱۳ عدد",
        judgeDecision: "۱۸ عدد (تایید بازخوانی ایجنت A)",
        reason: "بررسی زوم میکروسکوپی تصویر نشان داد که اپراتور ابتدا رقم ۱۳ را با خودکار نوشته، اما بلافاصله روی رقم ۳ را قلم زده و عدد ۸ را بر روی آن اصلاح کرده است. تشخیص خط‌خوردگی ایجنت A صحیح بوده و عدد نهایی ۱۸ است."
      },
      {
        field: "ردیف ۵ - ستون ضایعات (Waste Count)",
        agentAValue: "۳۰ عدد",
        agentBValue: "۳۵ عدد",
        judgeDecision: "۳۰ عدد (تایید بازخوانی ایجنت A)",
        reason: "وجود لکه روغنی/جوهر در کناره سمت راست عدد ۰ باعث شده ایجنت B دندانه فرضی برای رقم ۵ متصور شود. با تحلیل لایه‌های کنتراست تصویر، رقم کاملاً بسته بوده و عدد ۳۰ قطعی است."
      }
    ],
    mathErrorsOnPaper: [
      {
        rowNumber: 3,
        paperValue: "۷۹۰ عدد",
        correctMathValue: "۷۸۰ عدد",
        description: "خطای تفریق دستی روی برگه: در ردیف ۳، تولید کل ۸۲۰ عدد و ضایعات ۴۰ عدد ثبت شده است. تفریق صحیح (۸۲۰ - ۴۰) برابر ۷۸۰ است، اما اپراتور شیفت روی کاغذ ۷۹۰ نوشته است (+۱۰ عدد خطا در ثبت انسانی)."
      },
      {
        rowNumber: 0,
        paperValue: "۲۵۶۵ عدد (مجموع نهایی برگه)",
        correctMathValue: "۲۵۵۵ عدد",
        description: "خطای تراز انتهای جدول: به دلیل خطای محاسباتی ردیف ۳، جمع کل تولید خالص برگه نیز ۲۵۶۵ نوشته شده بود که در داوری هوشمند به مقدار واقعی ۲۵۵۵ واحد اصلاح شد."
      }
    ],
    confidenceScore: 99.4
  },
  processingTimeMs: 1845
};

export const sampleImagesList = [
  {
    fileName: "image_04_hourly_production_report.jpg",
    title: "گزارش ساعتی خط تولید کارخانه",
    badge: "توصیه شده برای دمو",
    desc: "برگه رسمی روزانه شامل تولید قطعات، ضایعات و جمع پایانی شیفت"
  },
  {
    fileName: "image_01_handwritten_invoice.jpg",
    title: "فاکتور دست‌نویس با خط‌خوردگی",
    badge: "نمونه خط‌خوردگی",
    desc: "شامل ارقام اصلاح شده دستی و خط‌خوردگی با خودکار آبی"
  },
  {
    fileName: "image_06_qqc03_f_inspection.jpg",
    title: "فرم بازرسی کنترل کیفی قطعات (QC)",
    badge: "فرم صنعتی",
    desc: "شامل ستون‌های تایید فنی، ابعاد و ایرادات فنی"
  },
  {
    fileName: "image_07_construction_report.jpg",
    title: "گزارش روزانه کارگاهی و مصالح",
    badge: "گزارش شیفت",
    desc: "متریال ورودی و خروجی با دست‌خط کارگاهی"
  },
  {
    fileName: "image_08_form_sorat_vaziyat.webp",
    title: "فرم صورت‌وضعیت مالی و مقادیر کارکرد",
    badge: "صورت وضعیت",
    desc: "جدول ارقام مالی و مقادیر دست‌نویس"
  }
];
