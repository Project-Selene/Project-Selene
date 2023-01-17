import { render, screen } from '@testing-library/react';
import React from 'react';

import { Background } from './Background';

test('renders learn react link', () => {
	render(<Background />);
	const linkElement = screen.getByText(/asd/i);
	expect(linkElement).toBeInTheDocument();
});
