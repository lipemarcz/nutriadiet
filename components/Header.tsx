import React from 'react';
import { HeaderProps } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';
import { MenuIcon, ArrowLeft } from './Icons';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

/**
 * Header component with sticky navigation and responsive layout
 * Left: logo/brand, Center: nav (or hamburger on mobile), Right: actions
 * Uses flex with an absolutely centered middle group so the center
 * stays visually centered regardless of left/right widths.
 */
interface ExtraProps {
  rightSlot?: React.ReactNode
}

const Header: React.FC<HeaderProps & ExtraProps> = ({
  isDarkMode: _isDarkMode,
  onToggleDarkMode: _onToggleDarkMode,
  activeSection: _activeSection,
  onSetActiveSection,
  navigationLinks,
  rightSlot,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  const handleLogoClick = () => {
    navigate('/');
    onSetActiveSection('meal-builder');
  };
  
  const handleBackClick = () => {
    navigate(-1);
  };
  return (
    <header className={`sticky top-0 z-40 w-full border-b transition-colors duration-300 bg-[#0f1115] border-border`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Flex: left | center (absolute) | right for perfect centering */}
        <div className="relative h-16 flex items-center">
          {/* Left: Back button (if not home) + Logo + Brand */}
          <div className="flex items-center justify-start gap-3 flex-1 min-w-0">
            {!isHomePage && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBackClick}
                className="p-2 mr-2"
                aria-label="Voltar"
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <button onClick={handleLogoClick} className="flex items-center gap-3 hover:opacity-80 transition-opacity" aria-label="Ir para página inicial">
              <img src="/favicon.png?v=2025-09-14" alt="Nutria Diet" className="h-8 w-8 rounded-md" />
              <div className="flex flex-col">
                <div className="text-xl sm:text-2xl font-semibold tracking-tight text-white" aria-label="Nutria Diet">
                  Nutria <span className="text-[#22c55e]">Diet</span>
                </div>
                <div className="text-xs text-gray-400 -mt-1">
                  Gratuito para todos
                </div>
              </div>
            </button>
          </div>

          {/* Center: Navigation (desktop) / Hamburger (mobile) */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
            {/* Desktop nav */}
            <nav className="hidden md:flex gap-6">
              {navigationLinks.map((link) => {
                const path = link.id === 'tutorial' ? '/tutorial' : link.id === 'restrito' ? '/restrito' : '/'
                const isActive = location.pathname === path
                if (link.id === 'foods') return null
                return (
                  <button
                    key={link.id}
                    onClick={() => { onSetActiveSection(link.id); navigate(path) }}
                    className={`relative text-sm font-medium transition-colors ${isActive ? 'text-emerald-400' : 'text-gray-300 hover:text-white'}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.id === 'meal-builder' ? 'Inicio' : link.label}
                  </button>
                )
              })}
            </nav>
            
            {/* Mobile hamburger menu */}
            <div className="md:hidden">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="secondary" size="sm" className="p-2" aria-label="Abrir menu">
                    <MenuIcon size={20} />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content sideOffset={8} className={`bg-[#151923] text-white border border-border rounded-md shadow-lg p-1 min-w-[200px]`}>
                  {navigationLinks.map((link) => (
                    link.id === 'foods' ? null : (
                      <DropdownMenu.Item key={link.id} asChild>
                        <button
                          onClick={() => { onSetActiveSection(link.id); navigate(link.id === 'tutorial' ? '/tutorial' : link.id === 'restrito' ? '/restrito' : '/'); }}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm text-[#9aa4b2] hover:text-white hover:bg-[#1b2027]`}
                        >
                          {link.id === 'meal-builder' ? 'Inicio' : link.label}
                        </button>
                      </DropdownMenu.Item>
                    )
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-3 flex-1 min-w-0">
            {rightSlot}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

