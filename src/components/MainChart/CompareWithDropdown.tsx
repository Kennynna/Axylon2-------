import React, { useRef, useEffect, useState, forwardRef } from 'react';
import styled from 'styled-components';

interface CompareWithDropdownProps {
  open: boolean;
  selected: string[];
  setSelected: (v: string[]) => void;
  onClose: () => void;
  anchorWidth?: number;
  options: { label: string; color: string }[];
}

const DropdownMenu = styled.div<{width?: number}>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 5px;
  background: ${({ theme }) => theme.dropdownMenuBg};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  width: ${({width}) => width ? `${width}px` : '115px'};
  z-index: 10;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

const DropdownItem = styled.div<{
  $active?: boolean;
  $hovered?: boolean;
  $first?: boolean;
  $last?: boolean;
  $nextActive?: boolean;
  $nextHovered?: boolean;
  $prevActive?: boolean;
  $prevHovered?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px;
  font-family: 'Outfit', 'Outfit Fallback';
  font-size: 14px;
  font-weight: 400;
  color: ${({ $active, $hovered, theme }) => ($active || $hovered ? theme.buttonText : theme.textSecondary)};
  background: ${({ $active, $hovered, theme }) => ($active || $hovered ? theme.textAccent : 'transparent')};
  border-radius: ${({$first, $last, $nextActive, $nextHovered, $prevActive, $prevHovered, $active, $hovered}) => {
    const isCurrent = $active || $hovered;
    const noTop = isCurrent && ($prevActive || $prevHovered);
    const noBottom = isCurrent && ($nextActive || $nextHovered);
    const tl = $first ? '6px' : (noTop ? '0' : '6px');
    const tr = $first ? '6px' : (noTop ? '0' : '6px');
    const br = $last ? '6px' : (noBottom ? '0' : '6px');
    const bl = $last ? '6px' : (noBottom ? '0' : '6px');
    return `${tl} ${tr} ${br} ${bl}`;
  }};
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-radius 0.2s;
  position: relative;
  z-index: ${({$active, $hovered}) => ($active || $hovered ? 1 : 0)};
  @media (max-width: 767px) {
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    font-weight: 400;
  }
`;

const ColorDot = styled.span<{color: string}>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({color}) => color};
`;

const CompareWithDropdown = forwardRef<HTMLDivElement, CompareWithDropdownProps>(
  ({ open, selected, setSelected, onClose, anchorWidth, options }, ref) => {
    const [hovered, setHovered] = useState<number | null>(null);

    useEffect(() => {
      if (!open) setHovered(null);
    }, [open]);

    if (!open) return null;
    return (
      <DropdownMenu ref={ref} width={anchorWidth}>
        {options.map((opt, i) => (
          <DropdownItem
            key={opt.label}
            $active={selected.includes(opt.label)}
            $hovered={hovered === i}
            $first={i === 0}
            $last={i === options.length - 1}
            $nextActive={i < options.length - 1 && selected.includes(options[i + 1].label)}
            $nextHovered={i < options.length - 1 && hovered === i + 1}
            $prevActive={i > 0 && selected.includes(options[i - 1].label)}
            $prevHovered={i > 0 && hovered === i - 1}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => {
              setSelected(selected.includes(opt.label)
                ? selected.filter(l => l !== opt.label)
                : [...selected, opt.label]);
            }}
          >
            <ColorDot color={opt.color} />
            {opt.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    );
  }
);

export default CompareWithDropdown; 