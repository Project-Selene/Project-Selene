import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';
import React from 'react';

import { ModsButton } from './ModsButton';

describe('<ModsButton />', () => {
	test('it should mount', () => {
		render(<ModsButton onModsOpen={() => 0} />);

		const homeButtonsModsButton = screen.getByRole('button');

		expect(homeButtonsModsButton).toBeInTheDocument();
	});
});