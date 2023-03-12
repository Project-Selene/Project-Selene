import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';
import React from 'react';

import { NOJSWarning } from './NojsWarning';

describe('<NOJSWarning />', () => {
	test('it should mount', () => {
		Object.defineProperty(navigator, 'userAgent', { value: 'ReactSnap' });
		render(<NOJSWarning />);

		const nojsWarning = screen.getByText('Requires Javascript');

		expect(nojsWarning).toBeInTheDocument();
	});
});