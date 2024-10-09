import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Button, ButtonGroup, Menu, MenuItem, Stack } from '@mui/material';
import React from 'react';

import './HomeButton.scss';

export function HomeButton(props: {
	title: string,
	onClick?: () => void,
	href?: string
	actions?: { title: string, onClick: () => void }[],
	loading?: boolean,
	disabled?: boolean,
}) {
	const [open, setOpen] = React.useState(false);
	const anchorRef = React.useRef<HTMLDivElement>(null);

	return <>
		<Stack className="home-button-group">
			{
				props.actions ?
					<ButtonGroup variant="outlined" ref={anchorRef}>
						<Button className="home-button" sx={{ width: '100%' }} onClick={props.onClick} href={props.href} style={{ backgroundColor: '#44E6' }} disabled={props.loading || props.disabled}>
							{props.title}
						</Button>
						<Button className="home-button" size="small" onClick={() => setOpen(true)} disabled={props.loading || props.disabled}>
							<ArrowDropDownIcon />
						</Button>
					</ButtonGroup>
					:
					<Button variant="outlined" className="home-button" sx={{ width: '100%' }} onClick={props.onClick} href={props.href} style={{ backgroundColor: '#44E6' }} disabled={props.loading || props.disabled}>
						{props.title}
					</Button>
			}
			<Menu open={open} anchorEl={anchorRef.current} onClose={() => setOpen(false)}>
				{
					props.actions?.map((value, i) =>
						<MenuItem key={i} onClick={value.onClick}>
							{value.title}
						</MenuItem>)
				}
			</Menu>
		</Stack >
	</>;
}