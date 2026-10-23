import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  X,
  KeyRound
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, showToast } = useApp();

  // Dados preenchidos por padrão conforme solicitado
  const [email, setEmail] = useState('mayconconsultoria@gmail.com');
  const [password, setPassword] = useState('SenhaSegura123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('mayconconsultoria@gmail.com');
  const [recoverySent, setRecoverySent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setErrorMessage('Por favor, informe seu e-mail de acesso.');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Por favor, digite sua senha.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const success = login(cleanEmail, cleanPassword);
      if (success) {
        confetti({
          particleCount: 50,
          spread: 55,
          origin: { y: 0.6 }
        });
      } else {
        setIsLoading(false);
        setErrorMessage('Credenciais inválidas. Verifique o e-mail e a senha informados.');
      }
    }, 350);
  };

  const handleSendRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      showToast('Digite o e-mail para recuperação.', 'error');
      return;
    }
    setRecoverySent(true);
    setTimeout(() => {
      setForgotPasswordModal(false);
      setRecoverySent(false);
      showToast(`Link de recuperação enviado para ${recoveryEmail}!`, 'success');
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-[#f4f5f7] text-neutral-900 font-sans select-none">
      
      {/* Espaçador superior para manter o card harmonioso */}
      <div className="w-full h-4 sm:h-8" />

      {/* Conteúdo Central */}
      <main className="w-full flex flex-col items-center justify-center px-4 py-4 sm:py-6">
        
        {/* Card Principal - Padrão e estilo das páginas internas do SaaS */}
        <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200/80 p-7 sm:p-9 shadow-xs space-y-6">
        
        {/* Topo do Card com Logo MB Web Digital */}
        <div className="text-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-[#ff2a85] flex items-center justify-center text-white shadow-md shadow-pink-500/20 mx-auto">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 3v18c-1.2 0-2.4-.6-3.1-1.6L5.4 15H3c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2h2.4l3.5-4.4c.7-1 1.9-1.6 3.1-1.6zm4.5 4.5c1.8 1.8 2.8 4.2 2.8 6.5s-1 4.7-2.8 6.5l-1.4-1.4c1.4-1.4 2.2-3.3 2.2-5.1s-.8-3.7-2.2-5.1l1.4-1.4zm3.5-3.5c2.7 2.7 4.2 6.3 4.2 9.9s-1.5 7.2-4.2 9.9l-1.4-1.4c2.3-2.3 3.6-5.4 3.6-8.5s-1.3-6.2-3.6-8.5l1.4-1.4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900 tracking-tight">
              MB Web Digital
            </h1>
            <p className="text-xs text-neutral-500 font-normal mt-0.5">
              Acesse sua conta para continuar
            </p>
          </div>
        </div>

        {/* Mensagem de Erro (se houver) */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campo E-mail */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 block">
              E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mayconconsultoria@gmail.com"
                autoComplete="email"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ff2a85]/20 focus:border-[#ff2a85] transition font-medium"
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800 block">
                Senha
              </label>
              <button
                type="button"
                onClick={() => setForgotPasswordModal(true)}
                className="text-xs text-[#ff2a85] hover:underline font-semibold cursor-pointer"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="SenhaSegura123!"
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-mono text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ff2a85]/20 focus:border-[#ff2a85] transition font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Checkbox Lembrar-me simplificado */}
          <div className="flex items-center pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-[#ff2a85] accent-[#ff2a85] cursor-pointer"
              />
              <span className="text-xs text-neutral-600 font-medium">
                Lembrar-me
              </span>
            </label>
          </div>

          {/* Botão de Entrada */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#ff2a85] hover:bg-[#e01e72] active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-pink-500/20 transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Entrando...</span>
              </>
            ) : (
              <>
                <span>Entrar na plataforma</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>

        </form>

      </div>

    </main>

    {/* Rodapé fixado na parte inferior da tela */}
    <footer className="w-full py-4 px-6 text-center text-xs text-neutral-500 border-t border-neutral-200/80 bg-white/40">
      © 2026 MB Web Digital. Todos os direitos reservados.
    </footer>

    {/* Modal Esqueceu a Senha */}
    {forgotPasswordModal && (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl border border-neutral-200 max-w-sm w-full p-6 space-y-4 shadow-xl relative animate-in zoom-in-95 duration-150">
          <button
            onClick={() => setForgotPasswordModal(false)}
            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 rounded-lg cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-[#fff7fa] border border-[#fce7f3] text-[#ff2a85] flex items-center justify-center mb-2">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Recuperar senha</h3>
            <p className="text-xs text-neutral-500">
              Informe o e-mail cadastrado para receber o link de redefinição de senha.
            </p>
          </div>

          <form onSubmit={handleSendRecovery} className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-800 block">E-mail</label>
              <input
                type="email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ff2a85]/20 focus:border-[#ff2a85]"
                placeholder="mayconconsultoria@gmail.com"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setForgotPasswordModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={recoverySent}
                className="flex-1 py-2.5 rounded-xl bg-[#ff2a85] hover:bg-[#e01e72] text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                {recoverySent ? 'Enviando...' : 'Enviar link'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

  </div>
);
};
