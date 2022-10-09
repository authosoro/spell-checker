import React from 'react';
import { LanguageBox } from '@components/LanguageBox';

export const Home: React.FC<{}> = () => {

    return (
        <div className="App">
            <div className="header">
                <h2 style={{textAlign: "center"}}>Strategic Agenda Spell Checker</h2>
            </div>

            <div className="app-container">
                <div className="language-group french-container">
                    <LanguageBox lang="fr"/>
                    
                </div>
                <div className="language-group italian-container">
                    <LanguageBox lang="it"/>
                </div>
                <div className="language-group english-gb-container">
                    <LanguageBox lang="en-GB"/>
                </div>
            </div>
        </div>
    );
}



