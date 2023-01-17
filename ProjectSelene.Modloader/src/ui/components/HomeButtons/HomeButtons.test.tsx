import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';
import React from 'react';

import { HomeButtons } from './HomeButtons';

describe('<HomeButtons />', () => {
	test('it should mount', () => {
		render(<HomeButtons />);

		const homeButtons = screen.getByTestId('HomeButtons');

		expect(homeButtons).toBeInTheDocument();
	});
});