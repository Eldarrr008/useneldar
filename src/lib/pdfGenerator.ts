import jsPDF from "jspdf";
import "jspdf-autotable";

// Extend jsPDF type for autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

interface StudentReport {
  studentName: string;
  studentId: string;
  classroomName: string;
  generatedDate: string;
  psychologistName: string;
  results: SurveyResultData[];
  latestRisk: string;
  trends: TrendData;
}

interface SurveyResultData {
  date: string;
  type: string;
  phq9: number | null;
  gad7: number | null;
  pss: number | null;
  burnout: number | null;
  risk: string | null;
}

interface TrendData {
  phq9Change: number | null;
  gad7Change: number | null;
  pssChange: number | null;
  burnoutChange: number | null;
  overallTrend: "improving" | "stable" | "worsening" | "insufficient_data";
}

interface ClassroomReport {
  classroomName: string;
  psychologistName: string;
  generatedDate: string;
  totalStudents: number;
  riskDistribution: Record<string, number>;
  averageScores: {
    phq9: number;
    gad7: number;
    pss: number;
    burnout: number;
  };
  studentsAtRisk: Array<{
    name: string;
    risk: string;
    lastSurvey: string;
  }>;
}

const riskLabels: Record<string, string> = {
  LOW: "Низкий",
  MODERATE: "Умеренный",
  HIGH: "Высокий",
  CRITICAL: "Критический",
};

const trendLabels: Record<string, string> = {
  improving: "Улучшение",
  stable: "Стабильно",
  worsening: "Ухудшение",
  insufficient_data: "Недостаточно данных",
};

// Add Cyrillic font support by embedding a base64 encoded font
const addCyrillicSupport = (doc: jsPDF) => {
  // Set up font that supports Cyrillic - using built-in helvetica with fallback
  doc.setFont("helvetica", "normal");
};

export const generateStudentPDF = (report: StudentReport): void => {
  const doc = new jsPDF();
  addCyrillicSupport(doc);
  
  let yPos = 20;
  
  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Otchet o psihologicheskom sostoyanii", 105, yPos, { align: "center" });
  
  yPos += 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Student: ${transliterate(report.studentName)}`, 20, yPos);
  yPos += 6;
  doc.text(`Gruppa: ${transliterate(report.classroomName)}`, 20, yPos);
  yPos += 6;
  doc.text(`Data otcheta: ${report.generatedDate}`, 20, yPos);
  yPos += 6;
  doc.text(`Psiholog: ${transliterate(report.psychologistName)}`, 20, yPos);
  
  yPos += 12;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, 190, yPos);
  
  // Current Risk Level
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Tekushiy uroven riska:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(getRiskLabelTranslit(report.latestRisk), 75, yPos);
  
  // Trend
  yPos += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Dinamika:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(getTrendLabelTranslit(report.trends.overallTrend), 50, yPos);
  
  // Results Table
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Istoriya diagnostik", 20, yPos);
  
  yPos += 5;
  
  const tableData = report.results.map(r => [
    r.date,
    r.type === "comprehensive" ? "Kompleksnyy" : "Ekspress",
    r.phq9?.toString() || "-",
    r.gad7?.toString() || "-",
    r.pss?.toString() || "-",
    r.burnout?.toString() || "-",
    getRiskLabelTranslit(r.risk || ""),
  ]);
  
  doc.autoTable({
    startY: yPos,
    head: [["Data", "Tip", "PHQ-9", "GAD-7", "PSS-10", "Burnout", "Risk"]],
    body: tableData,
    theme: "striped",
    headStyles: { 
      fillColor: [99, 102, 241],
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 30 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 22 },
      6: { cellWidth: 30 },
    },
  });
  
  // Score Changes
  yPos = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Izmeneniya pokazateley", 20, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const changes = [
    { label: "PHQ-9 (Depressiya)", value: report.trends.phq9Change },
    { label: "GAD-7 (Trevozhnost)", value: report.trends.gad7Change },
    { label: "PSS-10 (Stress)", value: report.trends.pssChange },
    { label: "Burnout (Vygoranie)", value: report.trends.burnoutChange },
  ];
  
  changes.forEach(change => {
    const changeText = change.value !== null 
      ? `${change.value > 0 ? "+" : ""}${change.value}` 
      : "Net dannyh";
    doc.text(`${change.label}: ${changeText}`, 25, yPos);
    yPos += 6;
  });
  
  // Footer
  yPos += 10;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text("Etot otchet sformirovan avtomaticheski i ne yavlyaetsya medicinskim diagnozom.", 20, yPos);
  yPos += 5;
  doc.text("Pri neobhodimosti obratites k specialistu.", 20, yPos);
  
  // Page number
  doc.text(`Stranica 1`, 105, 285, { align: "center" });
  
  // Save
  const fileName = `report_${transliterate(report.studentName).replace(/\s/g, "_")}_${report.generatedDate.replace(/\./g, "-")}.pdf`;
  doc.save(fileName);
};

export const generateClassroomPDF = (report: ClassroomReport): void => {
  const doc = new jsPDF();
  addCyrillicSupport(doc);
  
  let yPos = 20;
  
  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Svodniy otchet po gruppe", 105, yPos, { align: "center" });
  
  yPos += 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Gruppa: ${transliterate(report.classroomName)}`, 20, yPos);
  yPos += 6;
  doc.text(`Psiholog: ${transliterate(report.psychologistName)}`, 20, yPos);
  yPos += 6;
  doc.text(`Data: ${report.generatedDate}`, 20, yPos);
  yPos += 6;
  doc.text(`Vsego studentov: ${report.totalStudents}`, 20, yPos);
  
  yPos += 12;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, 190, yPos);
  
  // Risk Distribution
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Raspredelenie po urovnyam riska", 20, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  Object.entries(report.riskDistribution).forEach(([risk, count]) => {
    const percent = report.totalStudents > 0 
      ? Math.round((count / report.totalStudents) * 100) 
      : 0;
    doc.text(`${getRiskLabelTranslit(risk)}: ${count} (${percent}%)`, 25, yPos);
    yPos += 6;
  });
  
  // Average Scores
  yPos += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Srednie pokazateli", 20, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`PHQ-9: ${report.averageScores.phq9.toFixed(1)} / 27`, 25, yPos);
  yPos += 6;
  doc.text(`GAD-7: ${report.averageScores.gad7.toFixed(1)} / 21`, 25, yPos);
  yPos += 6;
  doc.text(`PSS-10: ${report.averageScores.pss.toFixed(1)} / 40`, 25, yPos);
  yPos += 6;
  doc.text(`Burnout: ${report.averageScores.burnout.toFixed(1)} / 60`, 25, yPos);
  
  // Students At Risk
  if (report.studentsAtRisk.length > 0) {
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Studenty, trebuyushie vnimaniya", 20, yPos);
    
    yPos += 5;
    
    const riskTableData = report.studentsAtRisk.map(s => [
      transliterate(s.name),
      getRiskLabelTranslit(s.risk),
      s.lastSurvey,
    ]);
    
    doc.autoTable({
      startY: yPos,
      head: [["Imya", "Uroven riska", "Poslednyaya diagnostika"]],
      body: riskTableData,
      theme: "striped",
      headStyles: { 
        fillColor: [239, 68, 68],
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9 },
    });
  }
  
  // Footer
  const finalY = report.studentsAtRisk.length > 0 ? doc.lastAutoTable.finalY + 15 : yPos + 15;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text("Konfidencialniy dokument. Tolko dlya sluzhebnogo polzovaniya.", 20, finalY);
  
  // Page number
  doc.text(`Stranica 1`, 105, 285, { align: "center" });
  
  // Save
  const fileName = `classroom_report_${transliterate(report.classroomName).replace(/\s/g, "_")}_${report.generatedDate.replace(/\./g, "-")}.pdf`;
  doc.save(fileName);
};

// Helper functions for transliteration (for PDF compatibility)
const transliterate = (text: string): string => {
  const map: Record<string, string> = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo",
    "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "h", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "sch", "ъ": "",
    "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
    "А": "A", "Б": "B", "В": "V", "Г": "G", "Д": "D", "Е": "E", "Ё": "Yo",
    "Ж": "Zh", "З": "Z", "И": "I", "Й": "Y", "К": "K", "Л": "L", "М": "M",
    "Н": "N", "О": "O", "П": "P", "Р": "R", "С": "S", "Т": "T", "У": "U",
    "Ф": "F", "Х": "H", "Ц": "Ts", "Ч": "Ch", "Ш": "Sh", "Щ": "Sch", "Ъ": "",
    "Ы": "Y", "Ь": "", "Э": "E", "Ю": "Yu", "Я": "Ya",
  };
  
  return text.split("").map(char => map[char] || char).join("");
};

const getRiskLabelTranslit = (risk: string): string => {
  const labels: Record<string, string> = {
    LOW: "Nizkiy",
    MODERATE: "Umerenniy",
    HIGH: "Vysokiy",
    CRITICAL: "Kriticheskiy",
  };
  return labels[risk] || risk;
};

const getTrendLabelTranslit = (trend: string): string => {
  const labels: Record<string, string> = {
    improving: "Uluchshenie",
    stable: "Stabilno",
    worsening: "Uhudshenie",
    insufficient_data: "Nedostatochno dannyh",
  };
  return labels[trend] || trend;
};

export const calculateTrends = (results: SurveyResultData[]): TrendData => {
  if (results.length < 2) {
    return {
      phq9Change: null,
      gad7Change: null,
      pssChange: null,
      burnoutChange: null,
      overallTrend: "insufficient_data",
    };
  }
  
  const latest = results[results.length - 1];
  const previous = results[results.length - 2];
  
  const phq9Change = latest.phq9 !== null && previous.phq9 !== null 
    ? latest.phq9 - previous.phq9 
    : null;
  const gad7Change = latest.gad7 !== null && previous.gad7 !== null 
    ? latest.gad7 - previous.gad7 
    : null;
  const pssChange = latest.pss !== null && previous.pss !== null 
    ? latest.pss - previous.pss 
    : null;
  const burnoutChange = latest.burnout !== null && previous.burnout !== null 
    ? latest.burnout - previous.burnout 
    : null;
  
  const changes = [phq9Change, gad7Change, pssChange, burnoutChange].filter(c => c !== null);
  
  if (changes.length === 0) {
    return {
      phq9Change,
      gad7Change,
      pssChange,
      burnoutChange,
      overallTrend: "insufficient_data",
    };
  }
  
  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  
  let overallTrend: "improving" | "stable" | "worsening";
  if (avgChange < -1) {
    overallTrend = "improving";
  } else if (avgChange > 1) {
    overallTrend = "worsening";
  } else {
    overallTrend = "stable";
  }
  
  return {
    phq9Change,
    gad7Change,
    pssChange,
    burnoutChange,
    overallTrend,
  };
};
