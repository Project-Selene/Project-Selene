import '@testing-library/jest-dom/extend-expect';

import { render, screen } from '@testing-library/react';
import React from 'react';

import { DownloadButton } from './DownloadButton';

describe('<DownloadButton />', () => {
	test('it should mount', () => {
		render(<DownloadButton />);

		const homeButtonsDownloadButton = screen.getByText('Download');

		expect(homeButtonsDownloadButton).toBeInTheDocument();
	});
});