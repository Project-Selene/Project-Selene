import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Button, ButtonGroup, Menu, MenuItem, Stack } from '@mui/material';
import React from 'react';

import './HomeButton.scss';

export function HomeButton(props: {
	title: string,
	onClick?: () => void,
	href?: string
	actions?: [{ title: string, onClick: () => void }],
	loading?: boolean
}) {
	const [open, setOpen] = React.useState(false);
	const anchorRef = React.useRef<HTMLDivElement>(null);

	return <>
		<Stack>
			<ButtonGroup variant="outlined" ref={anchorRef} className="home-button-group">
				<Button className="home-button w-100" onClick={props.onClick} href={props.href} style={{ backgroundColor: '#66F3' }} disabled={props.loading}>
					{props.title}
				</Button>
				{
					props.actions ?
						<Button className="home-button" size="small" onClick={() => setOpen(true)} disabled={props.loading}>
							<ArrowDropDownIcon />
						</Button>
						: <></>
				}

			</ButtonGroup>
			<Menu open={open} anchorEl={anchorRef.current}>
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