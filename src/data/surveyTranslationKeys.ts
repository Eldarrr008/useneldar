// Survey question and option translation keys
// These keys map to translations in i18n/locales/*.json

export interface TranslatedQuestion {
  id: string;
  category: "phq9" | "gad7" | "pss" | "burnout" | "open";
  textKey: string; // Translation key for question text
  type: "single-choice" | "multiple-choice" | "scale" | "text";
  options?: TranslatedOption[];
  required: boolean;
  placeholderKey?: string;
  inverted?: boolean;
}

export interface TranslatedOption {
  id: string;
  labelKey: string; // Translation key for option label
  value: number | string;
}

// Common option keys used across multiple scales
export const commonOptionKeys = {
  // PHQ-9 & GAD-7 frequency options (0-3)
  frequency4: {
    never: "questions.options.never",
    severalDays: "questions.options.severalDays",
    moreThanHalf: "questions.options.moreThanHalf",
    nearlyEveryDay: "questions.options.nearlyEveryDay",
  },
  // PSS-10 frequency options (0-4)
  frequency5: {
    never: "questions.options.never",
    almostNever: "questions.options.almostNever",
    sometimes: "questions.options.sometimes",
    fairlyOften: "questions.options.fairlyOften",
    veryOften: "questions.options.veryOften",
  },
  // MBI-SS frequency options (0-6)
  frequency7: {
    never: "questions.options.never",
    rarely: "questions.options.rarely",
    sometimes: "questions.options.sometimes",
    regularly: "questions.options.regularly",
    often: "questions.options.often",
    veryOften: "questions.options.veryOften",
    everyDay: "questions.options.everyDay",
  },
  // Yes/No options
  yesNo: {
    no: "questions.options.no",
    yes: "questions.options.yes",
  },
};
