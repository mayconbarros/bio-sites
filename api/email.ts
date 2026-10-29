import { Resend } from 'resend';

// Inicializa o Resend com a chave que está no seu arquivo .env
const resend = new Resend(process.env.RESEND_API_KEY);

// Essa é a função que você vai chamar quando o usuário pedir pra recuperar a senha
export async function enviarEmailRecuperacao(emailDestino: string, token: string) {
  
  // Monta o link que o usuário vai clicar. 
  // Ex: seusaas.com.br/recuperar-senha?token=1234abc
  const linkRecuperacao = `https://bio.mbwebdigital.com.br/recuperar-senha?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Suporte <onboarding@resend.dev>', // Por enquanto use esse do Resend para testar. Depois você troca pro seu domínio.
      to: emailDestino,
      subject: 'Recuperação de Senha - Seu SaaS',
      html: `
        <h2>Você solicitou a recuperação de senha</h2>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${linkRecuperacao}">Redefinir Minha Senha</a>
      `,
    });

    if (error) {
      console.log('Erro do Resend:', error);
      return false;
    }
    return true; // Sucesso! E-mail enviado.
  } catch (err) {
    console.log('Erro no servidor:', err);
    return false;
  }
}