import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';
import React from 'react';

import { Character } from './Character';

describe('<Character />', () => {
	test('it should mount', () => {
		render(<Character />);

		const character = screen.getByTestId('Character');

		expect(character).toBeInTheDocument();
	});
});