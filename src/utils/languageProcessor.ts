import axios from "axios";
import { 
    getDictionaryWords, 
    getIgnoredWords, 
    getSuggestions, 
    saveSuggestions,
} from "./storage";

const SPELLING_SERVICE_ENDPOINT = "http://35.197.120.214:5000/api/v1/spell";
export enum  SupportedLanguages {
    "fr" = "French",
    "it" =  "Italian",
    "en-GB" = "English (UK)"
};
export type SupportedLanguageKey =  keyof typeof SupportedLanguages;

export type FocusWord = {
    original: string;
    suggestions: Array<string>;
    hasSuggestion: boolean
    startIndex: number;
    endIndex: number;
};
export type SpellingCheckResult = Omit<FocusWord, 'hasSuggestion' | 'startIndex' | 'endIndex'>;
export type SuggestionCheckResult = Omit<FocusWord, | 'startIndex' | 'endIndex'>

/* gets spelling suggestions for words in text from the strategic agenda spelling api */
export const checkSpelling = async (text: string, lang: SupportedLanguageKey): Promise<Array<SpellingCheckResult>> => {
    const filteredText = filterWords( filterWords(text, lang, "ignored"), lang, "dict" );
    var formData = new FormData();
    formData.append("text", filteredText);
    formData.append("lang", lang);

    try {
        const req = await axios({
            method: "post",
            url: SPELLING_SERVICE_ENDPOINT,
            data: formData,
            headers: { "Content-Type": "multipart/form-data" },
        });
        if(req.status === 200){
            const spellingCheckResult = req.data as Array<SpellingCheckResult>;
            saveSuggestions(spellingCheckResult, lang);
            return spellingCheckResult;
        }
        else{
            return []; //to do, notify user of the error
        }
    }
    catch(e){
        //ToDo: notify the user of the error
        return [];
    }  
}


export const findWordIndices = (word: string, text: string): Array<number> => {
    if (word.length === 0) { return []; }
    let startIndex = 0, index= 0, indices = [];
    while ((index = text.indexOf(word, startIndex)) > -1) {
        //match only word whole  words, not sub eg avoid 'ou' being matched in 'you'
        //for whole words, the char before it's index should be " " or ","
        const prefixChar = text.charAt(index-1)
        if(prefixChar === " " || prefixChar === "" || prefixChar === ",") {
            indices.push(index);
        }
        startIndex = index + word.length;
    }
    return indices;
}

export const filterWords = (text: string, lang: SupportedLanguageKey, type: "dict" | "ignored"): string => {
    const filterWords =  type === "dict"? getDictionaryWords(lang) : getIgnoredWords(lang);
    const filteredText = filterWords.reduce((curText, filterWord)=>{
        return curText.replaceAll(filterWord, "");
    }, text);   
    return filteredText;
}

export const checkSuggestions = (word: string, lang: SupportedLanguageKey): SuggestionCheckResult => {

    const suggestions = getSuggestions(lang);
    const matchedSuggestion = suggestions.filter((s)=> s.original === word);
    //an existing suggestion found
    if(matchedSuggestion.length > 0){
        return {
            ...matchedSuggestion[0],
            hasSuggestion: true,
        }
    }
    //no saved suggestion found
    else{
        return {
            original: word,
            suggestions: [],
            hasSuggestion: false
        };
    }
}

export const getFocusWord = (index: number, text: string, lang: SupportedLanguageKey): FocusWord => {
    let startIndex=0, endIndex = text.length;
    for(let i=index;i>=0;i--){
        if(text.charAt(i) === " " || text.charAt(i) === ","){
            startIndex = i+1;
            break;
        }
    }
    for(let i=index;i<text.length;i++){
        if(text.charAt(i) === " " || text.charAt(i) === "," || text.charAt(i) === "\n" ){
            endIndex = i;
            break;
        }
    }

    const word = text.substring(startIndex, endIndex);
    const suggestions = checkSuggestions(word, lang);

    return { ...suggestions, startIndex, endIndex };
}