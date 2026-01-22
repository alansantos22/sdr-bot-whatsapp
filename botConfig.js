module.exports = {
  // Messages that must match exactly (case-sensitive or insensitive depending on logic, we will use insensitive for better UX)
  exactMatches: {
    "Olá, vim pelo site e quero saber mais": "Olá! Vi que você veio pelo nosso site. Seja bem-vindo! Eu sou o assistente virtual, em que posso ajudar?",
    "Preço": "Nossos preços variam dependendo do plano. Qual produto você tem interesse?",
    "Endereço": "Estamos localizados na Rua Exemplo, 123, Centro."
  },

  // Keywords that trigger a response if found in the message
  keywords: {
    "suporte": "Para suporte técnico, por favor envie um e-mail para suporte@exemplo.com ou aguarde um atendente.",
    "comprar": "Para comprar, acesse nosso site www.exemplo.com ou me diga qual item deseja.",
    "horário": "Nosso horário de atendimento é das 9h às 18h, de segunda a sexta."
  }
};
