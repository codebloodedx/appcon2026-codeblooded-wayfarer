const logoUrl = new URL('./assets/logo.png', import.meta.url).href;
const iconUrl = new URL('./assets/wayfarer-icon-rounded.png', import.meta.url).href;

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

export { logoUrl as wayfarerLogoUrl, iconUrl as wayfarerIconUrl };
