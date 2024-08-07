
import React from 'react';

export function FilterHighlight(props: { text: string, filter: string } | { children: string, filter: string }) {
	const text = 'text' in props ? props.text : props.children;
	const filter = props.filter.toLowerCase();
	if (!filter) {
		return <>{text}</>;
	}


	const lowerText = text.toLowerCase();
	const filterParts = filter.toLowerCase().split(/\s+/).filter(x => x);
	const parts: React.ReactNode[] = [];
	let index = 0;
	let minIndex = 0; // For overlapping matches
	while (index < text.length) {
		let start = -1;
		let length = 0;

		for (const part of filterParts) {
			const i = lowerText.indexOf(part, index);
			if (i === -1) {
				continue;
			}
			if (start !== -1 && i > start) {
				continue;
			}
			if (i === start && part.length < length) {
				continue;
			}
			start = i;
			length = part.length;
		}

		if (start === -1) {
			parts.push(<React.Fragment key={minIndex}>{text.slice(minIndex)}</React.Fragment>);
			break;
		}

		if (start > minIndex) {
			parts.push(<React.Fragment key={minIndex}>{text.slice(minIndex, start)}</React.Fragment>);
		}
		parts.push(<React.Fragment key={Math.max(start, minIndex)}><span style={{ color: '#69bdfc' }}>{text.slice(Math.max(start, minIndex), start + length)}</span></React.Fragment>);
		index = start + 1;
		minIndex = start + length;
	}
	return <>{parts}</>;
}
