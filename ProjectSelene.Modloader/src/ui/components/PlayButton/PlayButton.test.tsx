import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';
import React from 'react';

import { PlayButton } from './PlayButton';

describe('<OpenButton />', () => {
	test('it should mount', () => {
		render(<PlayButton title="asd" />);

		const homeButtons = screen.getByTestId('OpenButton');

		expect(homeButtons).toBeInTheDocument();
	});
});