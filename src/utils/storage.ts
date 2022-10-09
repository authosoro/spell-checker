import { SpellingCheckResult, SupportedLanguageKey } from "./languageProcessor";

const SUGGESTION_STORAGE_NAMESPACE = "suggestions";
const IGNORE_STORAGE_NAMESPACE = "ignore";
const DICT_STORAGE_NAMESPACE = "dict";

export const saveSuggestions = (suggestions: Array<SpellingCheckResult>, lang: SupportedLanguageKey) => {
    const storageKey = `${SUGGESTION_STORAGE_NAMESPACE}-${lang}`;
    window.localStorage.setItem(storageKey, JSON.stringify(suggestions));
};

export const getSuggestions = (lang: SupportedLanguageKey): Array<SpellingCheckResult> => {
    const storageKey = `${SUGGESTION_STORAGE_NAMESPACE}-${lang}`;
    const rawSavedData = window.localStorage.getItem(storageKey);
    if(rawSavedData === null){return []}
    return JSON.parse(rawSavedData) as Array<SpellingCheckResult>;
};

export const removeFromSuggestions = (word: string, lang: SupportedLanguageKey) => {
    const currentSuggestions = getSuggestions(lang);
    const updatedSuggestions = currentSuggestions.filter((suggestion)=> suggestion.original !== word );
    saveSuggestions(updatedSuggestions, lang);
};


export const saveIgnoredWord = (word: string, lang: SupportedLanguageKey) => {
    const storageKey = `${IGNORE_STORAGE_NAMESPACE}-${lang}`;
    const ignoredWords = getIgnoredWords(lang);
    ignoredWords.push(word);
    window.localStorage.setItem(storageKey, JSON.stringify(ignoredWords));
};

export const getIgnoredWords = (lang: SupportedLanguageKey): Array<string> => {
    const storageKey = `${IGNORE_STORAGE_NAMESPACE}-${lang}`;
    const rawSavedData = window.localStorage.getItem(storageKey);
    if(rawSavedData === null){return []}
    return JSON.parse(rawSavedData) as Array<string>;
};

export const saveWordToDictionary = (word: string, lang: SupportedLanguageKey) => {
    const storageKey = `${DICT_STORAGE_NAMESPACE}-${lang}`;
    const dictWords = getDictionaryWords(lang);
    if(!dictWords.includes(word)){
        dictWords.push(word);
        window.localStorage.setItem(storageKey, JSON.stringify(dictWords));
    }
};
export const updateDictionary = (words: Array<string>, lang: SupportedLanguageKey) => {
    const storageKey = `${DICT_STORAGE_NAMESPACE}-${lang}`;
    window.localStorage.setItem(storageKey, JSON.stringify(words));
};

export const getDictionaryWords = (lang: SupportedLanguageKey): Array<string> => {
    const storageKey = `${DICT_STORAGE_NAMESPACE}-${lang}`;
    const rawSavedData = window.localStorage.getItem(storageKey);
    if(rawSavedData === null){return []}
    return JSON.parse(rawSavedData) as Array<string>;
};

export const clearLanguageDatabase = (lang: SupportedLanguageKey) => {
    const suggestionKey = `${SUGGESTION_STORAGE_NAMESPACE}-${lang}`;
    const ignoreKey = `${IGNORE_STORAGE_NAMESPACE}-${lang}`;
    const dictKey = `${DICT_STORAGE_NAMESPACE}-${lang}`;
    window.localStorage.removeItem(suggestionKey);
    window.localStorage.removeItem(ignoreKey);
    window.localStorage.removeItem(dictKey);
};

export const clearAllDatabase = () => {
    window.localStorage.clear();
};