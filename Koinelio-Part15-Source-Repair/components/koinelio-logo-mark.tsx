import Image from 'next/image';

type KoinelioLogoMarkProps = {
  size?: number;
  className?: string;
};

/** Approved Koinelio campus mark. The source artwork is stored in public/brand. */
export default function KoinelioLogoMark({ size = 32, className = '' }: KoinelioLogoMarkProps) {
  return (
    <Image
      src="/brand/koinelio-mark.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      priority
      className={`shrink-0 object-contain ${className}`}
    />
  );
}