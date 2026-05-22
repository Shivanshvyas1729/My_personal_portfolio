import React from 'react';
import { 
  ArrowUpLeft, 
  ArrowUp, 
  ArrowUpRight, 
  ArrowLeft, 
  Move, 
  ArrowRight, 
  ArrowDownLeft, 
  ArrowDown, 
  ArrowDownRight 
} from 'lucide-react';

interface ObjectPositionPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export const ObjectPositionPicker: React.FC<ObjectPositionPickerProps> = ({ value, onChange }) => {
  const positions = [
    { label: 'Top Left', val: '0% 0%', icon: ArrowUpLeft },
    { label: 'Top Center', val: '50% 0%', icon: ArrowUp },
    { label: 'Top Right', val: '100% 0%', icon: ArrowUpRight },
    { label: 'Center Left', val: '0% 50%', icon: ArrowLeft },
    { label: 'Center', val: '50% 50%', icon: Move },
    { label: 'Center Right', val: '100% 50%', icon: ArrowRight },
    { label: 'Bottom Left', val: '0% 100%', icon: ArrowDownLeft },
    { label: 'Bottom Center', val: '50% 100%', icon: ArrowDown },
    { label: 'Bottom Right', val: '100% 100%', icon: ArrowDownRight },
  ];

  return (
    <div className="w-full max-w-[140px]">
      <div className="grid grid-cols-3 gap-1 p-1.5 bg-muted/10 border border-border/30 rounded-xl">
        {positions.map((pos) => {
          const Icon = pos.icon;
          const isActive = value === pos.val || (value === '' && pos.val === '50% 50%');
          return (
            <button
              key={pos.val}
              type="button"
              onClick={() => onChange(pos.val)}
              className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                  : 'hover:bg-primary/10 text-muted-foreground hover:text-foreground'
              }`}
              title={pos.label}
            >
              <Icon size={14} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
