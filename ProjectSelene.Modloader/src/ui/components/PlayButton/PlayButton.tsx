import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Button, ButtonGroup, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper, Stack } from '@mui/material';
import React, { useState } from 'react';

import './PlayButton.scss';


export function PlayButton(props: { title: string, onClick?: React.MouseEventHandler<HTMLButtonElement> }) {
	const anchorRef = React.useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	const [selectedIndex, setSelectedIndex] = React.useState(1);

	const handleToggle = () => {
		setOpen((prevOpen) => !prevOpen);
	};

	const handleClose = (event: Event) => {
		if (
			anchorRef.current &&
			anchorRef.current.contains(event.target as HTMLElement)
		) {
			return;
		}

		setOpen(false);
	};
	const handleMenuItemClick = (
		event: React.MouseEvent<HTMLLIElement, MouseEvent>,
		index: number,
	) => {
		setSelectedIndex(index);
		setOpen(false);
	};

	const options: any[] = [<span className="" key={1}>hi</span>];

	return <Stack direction="column" spacing={1} justifyContent="start" className="mt-3 group text-center align-items-center">

		<ButtonGroup variant="outlined" ref={anchorRef} aria-label="split button" className="w-100 play-button">
			<Button className="w-100">Play</Button>
			<Button
				size="small"
				aria-controls={open ? 'split-button-menu' : undefined}
				aria-expanded={open ? 'true' : undefined}
				aria-label="select merge strategy"
				aria-haspopup="menu"
				onClick={handleToggle}
			>
				<ArrowDropDownIcon />
			</Button>
		</ButtonGroup>
		<Popper
			sx={{
				zIndex: 1000,
			}}
			open={open}
			anchorEl={anchorRef.current}
			role={undefined}
			transition
			disablePortal
		>
			{({ TransitionProps, placement }) => (
				<Grow
					{...TransitionProps}
					style={{
						transformOrigin:
							placement === 'bottom' ? 'center top' : 'center bottom',
					}}
				>
					<Paper className="dropdown">
						<ClickAwayListener onClickAway={handleClose}>
							<MenuList id="split-button-menu" autoFocusItem>
								{options.map((option, index) => (
									<MenuItem
										key={option}
										disabled={index === 2}
										selected={index === selectedIndex}
										onClick={(event) => handleMenuItemClick(event, index)}
									>
										{option}
									</MenuItem>
								))}
							</MenuList>
						</ClickAwayListener>
					</Paper>
				</Grow>
			)}
		</Popper>
	</Stack>;
}