import React from 'react';

export interface CustomToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  ariaLabel?: string;
  className?: string;
  id?: string;
  name?: string;
}

/**
 * CustomToggle
 * 
 * Componente Global e Padronizado de Toggle Switch (Liga/Desliga) do SaaS.
 * - Borda escura fina de 1px (#1a1a1a)
 * - Padding zero (p-0) com encaixe perfeito da bolinha (thumb) e fundo contra a borda
 * - Ativo (Ligado): Fundo rosa vibrante (#ff2a85) e bolinha branca (#ffffff)
 * - Inativo (Desligado): Fundo branco (#ffffff) e bolinha cinza (#d1d5db)
 */
export const CustomToggle: React.FC<CustomToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  title,
  ariaLabel,
  className = '',
  id,
  name,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === ' ' || e.key === 'Enter') && !disabled) {
      e.preventDefault();
      e.stopPropagation();
      onChange(!checked);
    }
  };

  // Size geometry with 1px border (border border-[#1a1a1a]) and 0px padding:
  // md: outer 44px x 24px (w-11 h-6). Inner height = 22px. Thumb = 22px x 22px. Travel = 42px - 22px = 20px.
  // sm: outer 34px x 20px. Inner height = 18px. Thumb = 18px x 18px. Travel = 32px - 18px = 14px.
  // lg: outer 52px x 28px. Inner height = 26px. Thumb = 26px x 26px. Travel = 50px - 26px = 24px.
  const sizeStyles = {
    sm: {
      track: 'w-[34px] h-[20px]',
      thumb: 'w-[18px] h-[18px]',
      translate: checked ? 'translate-x-[14px]' : 'translate-x-0',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-[22px] h-[22px]',
      translate: checked ? 'translate-x-[20px]' : 'translate-x-0',
    },
    lg: {
      track: 'w-[52px] h-[28px]',
      thumb: 'w-[26px] h-[26px]',
      translate: checked ? 'translate-x-[24px]' : 'translate-x-0',
    },
  }[size];

  return (
    <button
      type="button"
      role="switch"
      id={id}
      name={name}
      aria-checked={checked}
      aria-label={ariaLabel || title || (checked ? 'Desativar' : 'Ativar')}
      title={title || (checked ? 'Desativar' : 'Ativar')}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center shrink-0 rounded-full border border-[#1a1a1a] p-0 transition-colors duration-200 overflow-hidden box-border select-none ${
        sizeStyles.track
      } ${
        checked ? 'bg-[#ff2a85]' : 'bg-white'
      } ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`rounded-full shadow-xs transition-transform duration-200 block shrink-0 ${
          sizeStyles.thumb
        } ${sizeStyles.translate} ${
          checked ? 'bg-white' : 'bg-neutral-300'
        }`}
      />
    </button>
  );
};

export default CustomToggle;
