import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';
import React from 'react';

import { ModsDialog } from './ModsDialog';

describe('<ModsDialog />', () => {
	test('it should mount', () => {
		render(<ModsDialog />);

		const dialog = screen.getByTestId('ModsDialog');

		expect(dialog).toBeInTheDocument();
	});
});