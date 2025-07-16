import styled from 'styled-components';
import { colors, shadows, typography, spacing, transitions, borderRadius } from '../../constants/theme';

export const ChartBlock = styled.div`
  background: ${({ theme }) => theme.mainChartBg};
  border-radius: ${borderRadius.medium};
  box-shadow: ${shadows.light};
  padding: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  @media (max-width: 1024px) and (min-width: 768px) {
    height: 328px;
    min-height: unset;
    max-height: unset;
    padding: 20px;
  }
  @media (max-width: 767px) {
    min-height: 320px;
    padding: 16px;
  }
   @media (max-width: 425px) {
    width: 100vw !important;
    max-width: 100vw !important;
    margin: 0 !important;
    padding: 16px !important;
    box-sizing: border-box;
  }
`;

export const FiltersRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: ${spacing.large};
  @media (max-width: 1024px) {
    justify-content: flex-end;
  }
`;

export const TimeframeFilterWrapper = styled.div`
  display: flex;
  background: ${({ theme }) => theme.timeframeFilterBg};
  border-radius: ${borderRadius.small};
`;

export const TimeframeButton = styled.button<{
  $active?: boolean;
  $first?: boolean;
  $last?: boolean;
  $isPrevActive?: boolean;
  $isNextActive?: boolean;
  $isPrevHover?: boolean;
  $isNextHover?: boolean;
  $hovered?: boolean;
}>`
  background: ${({$active, $hovered}) => ($active || $hovered ? colors.primary : 'transparent')};
  color: ${({$active, $hovered, theme}) => ($active || $hovered ? colors.text.primary : theme.timeframeFilterText)};
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize.regular};
  font-weight: 400;
  border: none;
  outline: none;
  padding: ${spacing.small};
  border-radius: ${({$first, $last, $isPrevActive, $isNextActive, $isPrevHover, $isNextHover, $active, $hovered}) => {
    const tl = $first ? borderRadius.small : (($isPrevActive && $hovered) || ($isPrevHover && $active) ? '0' : borderRadius.small);
    const tr = $last ? borderRadius.small : (($isNextActive && $hovered) || ($isNextHover && $active) ? '0' : borderRadius.small);
    const br = $last ? borderRadius.small : (($isNextActive && $hovered) || ($isNextHover && $active) ? '0' : borderRadius.small);
    const bl = $first ? borderRadius.small : (($isPrevActive && $hovered) || ($isPrevHover && $active) ? '0' : borderRadius.small);
    return `${tl} ${tr} ${br} ${bl}`;
  }};
  cursor: pointer;
  transition: background ${transitions.default}, color ${transitions.default}, border-radius ${transitions.default};
  margin-left: 0;
  margin-right: 0;
  z-index: ${({$active, $hovered}) => ($active || $hovered ? 1 : 0)};
  height: 28px;
  @media (max-width: 767px) {
    font-size: 12px;
    font-family: ${typography.fontFamily};
    font-weight: 400;
  }
`;

export const CompareButton = styled.button`
  background: ${colors.primary};
  color: ${colors.text.primary};
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize.regular};
  font-weight: 400;
  border: none;
  border-radius: ${borderRadius.small};
  padding: ${spacing.small};
  margin-left: ${spacing.medium};
  cursor: pointer;
  transition: background ${transitions.default}, color ${transitions.default};
  height: 28px;
  @media (max-width: 767px) {
    font-size: 12px;
    font-family: ${typography.fontFamily};
    font-weight: 400;
  }
`;

export const CompareButtonContent = styled.span`
  display: flex;
  align-items: center;
  gap: ${spacing.small};
`;

export const DropdownMenu = styled.div<{width?: number}>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: ${spacing.small};
  background: ${({ theme }) => theme.dropdownMenuBg};
  border-radius: ${borderRadius.small};
  box-shadow: ${shadows.medium};
  width: ${({width}) => width ? `${width}px` : '115px'};
  z-index: 10;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

export const DropdownItem = styled.div<{
  $active?: boolean;
  $hovered?: boolean;
  $first?: boolean;
  $last?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: ${spacing.small};
  padding: ${spacing.small};
  font-family: ${typography.fontFamily};
  font-size: ${typography.fontSize.regular};
  font-weight: 400;
  color: ${({$active, $hovered}) => ($active || $hovered ? colors.text.primary : colors.text.tertiary)};
  background: ${({$active, $hovered}) => ($active || $hovered ? colors.primary : 'transparent')};
  border-radius: ${({$first, $last}) => {
    if ($first && $last) return borderRadius.small;
    if ($first) return `${borderRadius.small} ${borderRadius.small} 0 0`;
    if ($last) return `0 0 ${borderRadius.small} ${borderRadius.small}`;
    return '0';
  }};
  cursor: pointer;
  transition: background ${transitions.default}, color ${transitions.default}, border-radius ${transitions.default};
  position: relative;
  z-index: ${({$active, $hovered}) => ($active || $hovered ? 1 : 0)};
  @media (max-width: 767px) {
    font-family: 'Outfit', sans-serif !important;
    font-size: 12px !important;
    font-weight: 400 !important;
  }
`;

export const ColorDot = styled.span<{color: string}>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({color}) => color};
`; 