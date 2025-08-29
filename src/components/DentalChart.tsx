import React from 'react';

interface DentalChartProps {
  selectedTeeth: number[];
  onTeethChange: (teeth: number[]) => void;
}

const Tooth: React.FC<{ number: number; isSelected: boolean; onClick: (number: number) => void }> = ({ number, isSelected, onClick }) => {
  const className = `
    w-8 h-10
    flex items-center justify-center
    border rounded cursor-pointer
    transition-colors duration-200
    ${isSelected ? 'bg-primary text-white border-sky-600' : 'bg-white hover:bg-sky-100 border-slate-300'}
  `;
  return (
    <div className="flex flex-col items-center">
      <div onClick={() => onClick(number)} className={className}>
        <span className="font-mono text-sm">{number}</span>
      </div>
    </div>
  );
};

const DentalChart: React.FC<DentalChartProps> = ({ selectedTeeth, onTeethChange }) => {
  const handleToothClick = (number: number) => {
    const newSelection = selectedTeeth.includes(number)
      ? selectedTeeth.filter(n => n !== number)
      : [...selectedTeeth, number];
    onTeethChange(newSelection.sort((a,b) => a - b));
  };
  
  const upperRight = Array.from({ length: 8 }, (_, i) => 8 - i); // 8 to 1
  const upperLeft = Array.from({ length: 8 }, (_, i) => 9 + i);  // 9 to 16
  const lowerLeft = Array.from({ length: 8 }, (_, i) => 17 + i); // 17 to 24
  const lowerRight = Array.from({ length: 8 }, (_, i) => 32 - i); // 32 to 25

  const Quadrant: React.FC<{ teeth: number[] }> = ({ teeth }) => (
    <div className="flex space-x-1">
      {teeth.map(num => (
        <Tooth 
          key={num} 
          number={num} 
          isSelected={selectedTeeth.includes(num)}
          onClick={handleToothClick} 
        />
      ))}
    </div>
  );

  return (
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
      <div className="flex justify-between mb-2">
        <Quadrant teeth={upperRight} />
        <Quadrant teeth={upperLeft} />
      </div>
      <div className="flex justify-between">
        <Quadrant teeth={lowerRight.reverse()} />
        <Quadrant teeth={lowerLeft} />
      </div>
    </div>
  );
};

export default DentalChart;
