import React from 'react';
import './App.scss';

export default class App extends React.Component {
    render(): React.ReactNode {
        return <div className="mdc-typography">
            <h1 className='mdc-typography--headline1 text-center'>Project Selene</h1>
            <h2 className='mdc-typography--subtitle1 text-center'>The modloader for Project Terra</h2>
            <button className="mdc-button mdc-button--raised"><span className="mdc-button__ripple"></span>Button</button>
        </div>
    }
}