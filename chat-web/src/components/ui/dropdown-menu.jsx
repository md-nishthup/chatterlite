import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2 } from 'lucide-react';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <MoreVertical className="w-5 h-5 cursor-pointer" />
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-48">
    <DropdownMenuItem
      onClick={deleteAllMessages}
      className="text-red-500 flex items-center gap-2 cursor-pointer"
    >
      <Trash2 className="w-4 h-4" />
      Delete All Messages
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => alert('Mute feature coming soon')}>
      Mute Notifications
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => alert('Block user feature coming soon')}>
      Block User
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
