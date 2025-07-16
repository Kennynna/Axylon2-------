import React from 'react';
import { TimeframeFilterWrapper, TimeframeButton } from './MainChart.styles';
import { Timeframe } from './MainChart.types';

interface TimeframeFilterProps {
  timeframes: readonly Timeframe[];
  activeIndex: number;
  hoverIndex: number | null;
  onClick: (index: number) => void;
  onMouseEnter: (index: number) => void;
  onMouseLeave: () => void;
}

const TimeframeFilter: React.FC<TimeframeFilterProps> = ({
  timeframes,
  activeIndex,
  hoverIndex,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  return (
    <TimeframeFilterWrapper>
      {timeframes.map((tf, index) => (
        <TimeframeButton
          key={tf}
          $active={index === activeIndex}
          $hovered={index === hoverIndex}
          $first={index === 0}
          $last={index === timeframes.length - 1}
          $isPrevActive={index > 0 && index - 1 === activeIndex}
          $isNextActive={index < timeframes.length - 1 && index + 1 === activeIndex}
          $isPrevHover={index > 0 && index - 1 === hoverIndex}
          $isNextHover={index < timeframes.length - 1 && index + 1 === hoverIndex}
          onClick={() => onClick(index)}
          onMouseEnter={() => onMouseEnter(index)}
          onMouseLeave={onMouseLeave}
        >
          {tf}
        </TimeframeButton>
      ))}
    </TimeframeFilterWrapper>
  );
};

export default TimeframeFilter; 