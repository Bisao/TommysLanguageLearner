/**
 * Utilitário para cálculo de sequências diárias (streaks)
 * 
 * Este módulo fornece funções para calcular e atualizar sequências diárias
 * de atividade dos usuários, um componente importante do sistema de gamificação.
 */

/**
 * Calcula a nova sequência diária com base na última data de atividade
 * @param lastActiveDate Última data de atividade do usuário (formato ISO YYYY-MM-DD)
 * @param currentStreak Sequência atual do usuário
 * @returns Objeto contendo a nova sequência e a data atual
 */
export const calculateNewStreak = (
  lastActiveDate: string | null, 
  currentStreak: number
): { newStreak: number; lastActiveDate: string } => {
  const today = new Date().toISOString().split('T')[0];
  let newStreak = currentStreak || 0;

  if (!lastActiveDate || lastActiveDate !== today) {
    if (lastActiveDate) {
      const lastDate = new Date(lastActiveDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Dia consecutivo - incrementa a sequência
        newStreak += 1;
      } else if (diffDays > 1) {
        // Sequência quebrada - reinicia
        newStreak = 1;
      }
    } else {
      // Primeira atividade
      newStreak = 1;
    }
  }
  
  return { newStreak, lastActiveDate: today };
};

