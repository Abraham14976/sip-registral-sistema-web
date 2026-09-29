const links = [
  ["Inicio", "/"],
  ["Mapa de lotes", "/mapa"],
  ["Inmobiliarias", "/inmobiliarias"],
  ["Certificados", "/certificados"],
] as const;

export default function SiteHeader({ active }: { active: string }) {
  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="SIP Registral inicio">
        <span className="brand-mark">S</span>
        <span>SIP <em>Registral</em></span>
      </a>
      <nav className="nav-links" aria-label="Navegación principal">
        {links.map(([label, href]) => <a className={active === label ? "active" : ""} href={href} key={href}>{label}</a>)}
      </nav>
      <span className="private-pill">Plataforma privada</span>
    </header>
  );
}
