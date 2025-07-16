// components/ListPopover.tsx

'use client';

import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { Button } from "@nextui-org/button";

interface Group {
  id: number;
  name: string;
  creater_id: number;
  members: Array<number>;
}

type ListPopoverProps = {
  items: Group[];
  onItemClick?: (groupId: number) => void;
};

export default function ListPopover({ items, onItemClick }: ListPopoverProps) {
  return (
    <Popover placement="bottom-start" showArrow>
      <PopoverTrigger>
        <Button variant="flat">Open List</Button>
      </PopoverTrigger>
      <PopoverContent className="p-2 w-56">
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="px-3 py-2 rounded-md hover:bg-default-200 cursor-pointer"
              onClick={() => onItemClick?.(item.id)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
