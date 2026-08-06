import { HexColorPicker } from 'react-colorful';
import { Popover } from './popover';
import { PopoverTrigger } from './popover';
import { Button } from './button';
import { Input } from './input';
import { PopoverContent } from './popover';

export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-30 justify-start">
          <div
            className="h-4 w-4 rounded mr-2 border"
            style={{ background: value }}
          />
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <HexColorPicker color={value} onChange={onChange} />
        <Input
          className="mt-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </PopoverContent>
    </Popover>
  );
}
