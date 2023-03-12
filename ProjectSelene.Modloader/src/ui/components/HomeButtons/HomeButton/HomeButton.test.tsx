import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';
import React from 'react';

import { HomeButton } from './HomeButton';

describe('<HomeButton />', () => {
	test('it should mount', () => {
		render(<HomeButton title="Hello" />);

		const homeButton = screen.getByText('Hello');

		expect(homeButton).toBeInTheDocument();
	});
});