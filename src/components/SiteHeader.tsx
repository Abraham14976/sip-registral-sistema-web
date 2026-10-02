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
        <svg className="brand-mark" viewBox="0 0 44 50" role="img" aria-label="Escudo SIP Registral">
          <path d="M22 2 41 8v15c0 11-7.3 19.2-19 25C10.3 42.2 3 34 3 23V8L22 2Z" />
          <path className="brand-mark-inner" d="M22 6 37 11v12c0 8.5-5.4 15-15 20-9.6-5-15-11.5-15-20V11L22 6Z" />
          <text x="22" y="27" textAnchor="middle">SIP</text>
          <path className="brand-mark-line" d="M12 31h20" />
        </svg>
        <span className="brand-name"><strong>SIP</strong><em>Registral</em></span>
      </a>
      <nav className="nav-links" aria-label="Navegación principal">
        {links.map(([label, href]) => <a className={active === label ? "active" : ""} href={href} key={href}>{label}</a>)}
      </nav>
      <span className="private-pill">Sistema Integral Predial</span>
    </header>
  );
}
