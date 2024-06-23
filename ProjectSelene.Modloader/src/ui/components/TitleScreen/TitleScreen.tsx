import { Background } from '../Background/Background';
import { Character } from '../Character/Character';
import { HomeButtons } from '../HomeButtons/HomeButtons';
import { InfoButton } from '../InfoButton/InfoButton';
import { InfoDialog } from '../InfoDialog/InfoDialog';
import { ModsDialog } from '../ModsDialog/ModsDialog';
import { OpenDialog } from '../OpenDialog/OpenDialog';
import { OptionsDialog } from '../OptionsDialog/OptionsDialog';
import { Title } from '../Title/Title';
import './TitleScreen.scss';

import React from 'react';

export function TitleScreen() {
	return <div className="body">
		<Title />
		<HomeButtons />
		<Character />
		<Background />
		<ModsDialog />
		<OptionsDialog />
		<OpenDialog />
		<InfoDialog />
		<InfoButton />
	</div>;
}
