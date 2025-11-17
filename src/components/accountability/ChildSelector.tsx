import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Child } from '@/types/accountability';

interface ChildSelectorProps {
  children: Child[];
  value?: string;
  onChange: (childId: string) => void;
  placeholder?: string;
  includeAll?: boolean;
}

export function ChildSelector({
  children,
  value,
  onChange,
  placeholder = 'Select child',
  includeAll = false,
}: ChildSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full md:w-[200px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAll && <SelectItem value="all">All Children</SelectItem>}
        {children.map((child) => (
          <SelectItem key={child.id} value={child.id}>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: child.avatar_color }}
              />
              <span>{child.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
