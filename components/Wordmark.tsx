import Image from 'next/image';
import Link from 'next/link';

interface WordmarkProps {
  height?: number;
  inverted?: boolean;
  href?: string;
}

export function Wordmark({ height = 28, inverted = false, href = '/' }: WordmarkProps) {
  const content = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Image
        src="/logo.png"
        alt="Callback"
        height={height}
        width={height * (1672 / 941)} // preserve aspect ratio
        style={{
          height,
          width: 'auto',
          // Invert for use on dark ink backgrounds (e.g. footer, auth panel)
          filter: inverted ? 'invert(1)' : 'none',
          // In dark theme the logo is black — make it white
          // We use a CSS filter approach that works with the theme
          display: 'block',
        }}
        priority
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
        {content}
      </Link>
    );
  }

  return content;
}
