import React from 'react';
import 'react-quill/dist/quill.snow.css';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

interface Props {
    originalWord: string;
    suggestions: Array<string>;
    onSelectSuggestion: (suggestion: string) => void;
    onAddToDictionary: (word: string) => void;
    onIgnore: (word: string) => void;
    isOpen: boolean;
    onClose: () => void;
    positionX: number;
}

export const SuggestionPopUp: React.FC<Props> = (
    {
        originalWord,
        suggestions,
        onSelectSuggestion,
        onAddToDictionary,
        onIgnore,
        isOpen,
        onClose,
        positionX
    }
) => {

    return (
            <Popup 
                open={isOpen}
                onClose={onClose}
                trigger={<span></span>} 
                position={"bottom left"}
                arrow={false}
                offsetX={positionX}
            >
                <div className='popup-menu-content'>
                    { suggestions.map((s)=> <div key={s} className='menu-item suggestion-item' onClick={()=>onSelectSuggestion(s)}>{s}</div>)}
                    <hr/>
                    <div className='menu-item action-item' onClick={()=>onAddToDictionary(originalWord)}>Add to Dictionary</div>
                    <div className='menu-item action-item' onClick={()=>onIgnore(originalWord)}> Ignore</div>
                </div>
            </Popup>
    );
}



