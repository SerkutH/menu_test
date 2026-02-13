import { AlertCircle } from 'lucide-react';

interface Props {
  opensAt: string;
}

export default function ClosedBanner({ opensAt }: Props) {
  return (
    <div className="sticky top-0 z-50 bg-red-500 text-white px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-2">
      <AlertCircle className="w-4 h-4" />
      <span>
        This restaurant is currently closed. Opens at <strong>{opensAt}</strong>. You can browse
        the menu but checkout is unavailable.
      </span>
    </div>
  );
}
