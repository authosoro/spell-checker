import React, { useCallback, useState, useMemo, useEffect} from 'react';
import ReactQuill from 'react-quill';
import { DeltaStatic } from "quill";
import { editorConfig, languageProcessor} from '@utils/index';
import 'react-quill/dist/quill.snow.css';
import 'reactjs-popup/dist/index.css';
import { SuggestionPopUp } from '@components/SuggestionPopUp';
import {  
    getFocusWord,
    FocusWord, 
    SupportedLanguageKey,
    SupportedLanguages
} from 'utils/languageProcessor';
import { 
    clearLanguageDatabase, 
    removeFromSuggestions, 
    saveIgnoredWord, 
    saveWordToDictionary 
} from 'utils/storage';

const EDITOR_VIEW_WIDTH = 400;
const MAX_CHAR_PER_ROW = 104;

/*ToDo: add documentation & comments
* In the meantime, the naming conventions should be descriptive enough to know what's going on
*/

export const LanguageBox: React.FC<{lang: SupportedLanguageKey}> = ({lang}) => {

    const [cursorPos, setCursorPos] = useState<number>(0);
    const [wordSuggestionPopupOpen, setWordSuggestionPopupOpen] = useState<boolean>(false);
    const [focusWord, setFocusWord] = useState<FocusWord>({original: "", suggestions:[], hasSuggestion: false, startIndex:0, endIndex:0});
    const editorRef = React.createRef<ReactQuill>();
    

    const getText = useCallback((): string => {
        const editorContent: DeltaStatic | undefined = editorRef.current?.editor?.getContents();
        //get the text input from the quill delta or default to empty string
        const text: string = (editorContent && editorContent.ops)? 
                                editorContent.ops.reduce((p, c)=> p + c.insert, "")
                                :  
                                "";
        return text;
    }, [editorRef]);

    
    const onChangeSelection = useCallback((range: ReactQuill.Range) => {
        const text = getText();
        if(range === null) return;
        const cursorPos = range.index;
        const wordInFocus = getFocusWord(cursorPos, text, lang);
        if(wordInFocus.hasSuggestion){
            setFocusWord(wordInFocus);
            setWordSuggestionPopupOpen(true);
        }
        setCursorPos(cursorPos);
    }, [getText, lang]);
    
    useEffect(()=> {
        editorRef.current?.editor?.on("selection-change", (range: ReactQuill.Range) => {
            onChangeSelection(range);
        });
    }, [editorRef, getText, lang, onChangeSelection]);

    const checkSpellingSuggestions = useCallback(() => {
        const text = getText();
        languageProcessor.checkSpelling(text, lang)
        .then((result)=> {
            result.forEach((scr)=> {
                //find the occurrences of this word in the text
                const wordIndices = languageProcessor.findWordIndices(scr.original, text);
                //mark them red
                wordIndices.forEach((wordIndex)=> {
                    editorRef.current?.editor?.formatText(wordIndex, scr.original.length, {color: 'red'});
                })
            })
        })
        .catch((e)=> alert("Sorry, we're having some trouble right now checking spellings for you. Please check your network or contact support if issue persists"));
       
    }, [editorRef, getText, lang]);
     

    const onSelectSuggestion = useCallback((suggestedWord: string)=> {
        editorRef.current?.editor?.deleteText(focusWord.startIndex, focusWord.original.length);
        editorRef.current?.editor?.insertText(focusWord.startIndex, suggestedWord)
    }, [editorRef, focusWord]);

    const onIgnore = useCallback((ignoredWord: string)=> {
        saveIgnoredWord(ignoredWord, lang);
        removeFromSuggestions(ignoredWord, lang);
        editorRef.current?.editor?.removeFormat(focusWord.startIndex, focusWord.original.length);
    } , [editorRef, focusWord, lang]);

    const onAddToDictionary = useCallback((newWord: string) => {
        saveWordToDictionary(newWord, lang);
        removeFromSuggestions(newWord, lang);
        editorRef.current?.editor?.removeFormat(focusWord.startIndex, focusWord.original.length);
    }, [editorRef, focusWord, lang]);

    const resetLanguageDatabase = useCallback(()=> {
        clearLanguageDatabase(lang);
        alert(`${SupportedLanguages[lang]} Dictionary Refreshed`)
    }, [lang]);

    const onTextChange = useCallback(async (_: string, delta: DeltaStatic) => {
        if(delta.ops && delta.ops[1] !== undefined){
            const newChar = delta?.ops[1].insert;
            //trigger spelling check only when comma or space indicates end of a word
            if(newChar === " " || newChar === ","){
                checkSpellingSuggestions();
            }
        }
        
    }, [checkSpellingSuggestions]);
    
    const popupPosX = useMemo(()=> (cursorPos/MAX_CHAR_PER_ROW)*EDITOR_VIEW_WIDTH, [cursorPos]);

    return (
        <div>
            <div>
                
                <div className='toolbar'>
                    <h3>{SupportedLanguages[lang]}</h3>
                    <button className='clear-btn' onClick={resetLanguageDatabase}>Refresh {SupportedLanguages[lang]} Dictionary</button>
                </div>
            </div>
            <ReactQuill 
                ref={editorRef}
                theme="snow"
                modules={editorConfig.modules} 
                formats={editorConfig.formats}  
                onChange={onTextChange}
            
            />
            <SuggestionPopUp
                suggestions={focusWord.suggestions}
                originalWord={focusWord.original}
                isOpen={wordSuggestionPopupOpen}
                onClose={()=>setWordSuggestionPopupOpen(false)}
                onAddToDictionary={onAddToDictionary}
                onIgnore={onIgnore}
                onSelectSuggestion={onSelectSuggestion}
                positionX={popupPosX}
            />
        </div>
    );
}



