import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';
import React from 'react';

import { NOJSWarning } from './NojsWarning';

describe('<NOJSWarning />', () => {
	test('it should mount', () => {
		render(<NOJSWarning />);

		const nojsWarning = screen.getByTestId('NOJSWarning');

		expect(nojsWarning).toBeInTheDocument();
	});
});