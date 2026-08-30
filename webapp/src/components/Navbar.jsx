import { useState } from 'react';
import { Menu, Shield, X } from 'lucide-react';

const links = [
  { href: '#home', label: 'Home' },
  { href: '#problem', label: 'Problem' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#explore', label: 'Explore Map' },
  { href: '#results', label: 'Results' },
  { href: '#recommendations', label: 'Recommendations' },
  { href: '#about', label: 'About' }
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Primary navigation">
        <a className="brand" href="#home" onClick={() => setIsOpen(false)}>
          <span className="brand-icon" aria-hidden="true">
            <Shield size={20} />
          </span>
          <span>
            <strong>UMD HeatShield</strong>
            <small>Powered by FortyGuard temperature intelligence</small>
          </span>
        </a>

        <button
          className="icon-button mobile-menu-button"
          type="button"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`nav-links ${isOpen ? 'is-open' : ''}`}>
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
