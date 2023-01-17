import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';
import React from 'react';

import { HomeButton } from './HomeButton';

describe('<HomeButtons />', () => {
	test('it should mount', () => {
		render(<HomeButton title="asd" />);

		const homeButtons = screen.getByTestId('HomeButtons');

		expect(homeButtons).toBeInTheDocument();
	});
});