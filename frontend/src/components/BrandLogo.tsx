const logoUrl = new URL('./assets/wayfarer-logo.jpeg', import.meta.url).href;

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = '' }: BrandLogoProps) {
  return (
    <span className={`brand-mark ${className}`.trim()} aria-hidden="true">
      <img src={logoUrl} alt="" />
    </span>
  );
}

export { logoUrl as wayfarerLogoUrl };
