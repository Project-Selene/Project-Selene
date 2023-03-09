import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';
import React from 'react';

import { PlayButton } from './PlayButton';

describe('<PlayButton />', () => {
	test('it should mount', () => {
		render(<PlayButton />);

		const homeButtonsPlayButton = screen.getByTestId('PlayButton');

		expect(homeButtonsPlayButton).toBeInTheDocument();
	});
});