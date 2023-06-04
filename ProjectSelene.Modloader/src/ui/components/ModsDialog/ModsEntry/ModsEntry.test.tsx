import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';
import React from 'react';

import { ModsEntry } from './ModsEntry';

describe('<ModsEntry />', () => {
	test('it should mount', () => {
		render(<ModsEntry id={0} />);

		const entry = screen.getByTestId('ModsEntry');

		expect(entry).toBeInTheDocument();
	});
});