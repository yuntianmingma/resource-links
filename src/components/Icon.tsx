// Minimal black-and-white line icons, 24x24 viewBox, 2px stroke
const paths: Record<string, string> = {
  book: 'M4 6a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm0 0h16M8 4v16',
  palette: 'M12 2a10 10 0 00-9.5 13.2l1.2 2.8H12l1.8-4.5A10 10 0 0012 2zm-3.5 9a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5-2a1.5 1.5 0 110-3 1.5 1.5 0 010 3z',
  film: 'M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 0l6 16m6-16l-6 16M2 9h7m-7 6h7m13-6h-7m7 6h-7',
  terminal: 'M6 9l4 3-4 3m6-4h4M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z',
  'more-horizontal': 'M6 12a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z',
  home: 'M3 10l9-7 9 7v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10zm6 12v-7h6v7',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zm-2.3-8.3l-.7-2.2-2.6 1 .3 2.2M5.7 6.6l-2-1L2.6 8l1.8 1.2m11.6-2.6l.7-2.2 2.6 1-.3 2.2m1.1 3l2 1-1 2.3-1.9-1.2m-11.9 0l-2 1.5 1 2.3 1.9-1.3m11.3 0l2 1.5-1 2.3-1.9-1.3m-4.2 2.3l.7 2.2-2.6 1-.3-2.2',
  lock: 'M7 11V7a5 5 0 1110 0v4m-9 0h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2zm5 4v2',
  key: 'M15 7a5 5 0 00-8.7-2.5m-2.3 6A5 5 0 0012 15l4 4 3-1-1-3-2-1-1 1-2-2zm0-2a1 1 0 100-2 1 1 0 000 2z',
  download: 'M12 3v12m-5-5l5 5 5-5M4 18h16',
  sun: 'M12 17a5 5 0 100-10 5 5 0 000 10zm0-15v2m0 16v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10l1.4 1.4M5.6 18.4l1.4-1.4m10-10l1.4-1.4',
  moon: 'M20 12A8 8 0 1112 4a6 6 0 008 8z',
  menu: 'M3 6h18M3 12h18M3 18h18',
  search: 'M10 17a7 7 0 100-14 7 7 0 000 14zm4-4l6 6',
  'arrow-up-right': 'M7 17L17 7m-6 0h6v6',
  check: 'M5 13l4 4L19 7',
  x: 'M6 6l12 12m0-12L6 18',
  link: 'M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.5 1.5M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.5-1.5',
};

interface Props {
  name: string;
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 22, className }: Props) {
  const d = paths[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={d} />
    </svg>
  );
}
