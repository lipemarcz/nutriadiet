import React from 'react';
import Card from './Card';
// Removed local MessageCircle usage; global floating button will be in AppShell

interface TutorialProps {
  isDarkMode: boolean;
}

const Tutorial: React.FC<TutorialProps> = ({ isDarkMode }) => {
  return (
    <div className="space-y-6 relative">
      <Card title="Visão Geral" isDarkMode={isDarkMode}>
        <div className="space-y-3 text-sm leading-6 text-gray-900">
          <p>
            O <span className="text-emerald-600 font-semibold">Nutria Diet</span> ajuda você a planejar refeições e acompanhar macros
            (proteínas, carboidratos, lipídeos e calorias) de forma simples, visual e prática.
          </p>
          <p>
            Você pode usar a plataforma <span className="text-emerald-700 font-semibold">completamente grátis</span> sem precisar criar conta.
            Não é necessário fazer login para utilizar todas as funcionalidades do app.
          </p>
        </div>
      </Card>

      <Card title="Como Funciona a Página Inicial" isDarkMode={isDarkMode}>
        <div className="space-y-4 text-sm leading-6 text-gray-900">
          <div>
            <h4 className="font-semibold text-emerald-600 mb-2">1. Seção de Refeições (Centro da Tela)</h4>
            <p>Esta é a área principal onde você constrói seu plano alimentar diário:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Seletor de Refeições:</strong> No topo, escolha entre 3 a 8 refeições por dia (ex: café, almoço, jantar)</li>
              <li><strong>Cards de Refeição:</strong> Cada refeição aparece como um card individual onde você pode adicionar alimentos</li>
              <li><strong>Botão "Adicionar Alimento":</strong> Dentro de cada card, clique para buscar e adicionar alimentos do banco de dados</li>
              <li><strong>Tabela de Alimentos:</strong> Mostra os alimentos adicionados com suas quantidades e valores nutricionais</li>
              <li><strong>Controles:</strong> Você pode renomear refeições, duplicá-las, excluí-las ou reordenar usando o seletor numérico</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-emerald-600 mb-2">2. Painel de Resumo Nutricional (Lado Direito)</h4>
            <p>O painel lateral mostra em tempo real os totais dos seus macronutrientes:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Calorias Totais:</strong> Soma de todas as calorias do dia (destaque visual)</li>
              <li><strong>Proteínas:</strong> Total de proteínas em gramas e percentual calórico</li>
              <li><strong>Carboidratos:</strong> Total de carboidratos em gramas e percentual calórico</li>
              <li><strong>Gorduras:</strong> Total de lipídeos em gramas e percentual calórico</li>
              <li><strong>Checagem g/kg:</strong> Ferramenta para avaliar a ingestão de proteína por kg de peso corporal</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-emerald-600 mb-2">3. Tabela de Resumo Detalhado (Abaixo das Refeições)</h4>
            <p>Uma tabela completa que mostra a distribuição de macronutrientes por refeição, permitindo análise detalhada do seu plano alimentar.</p>
          </div>

          <div>
            <h4 className="font-semibold text-emerald-600 mb-2">4. Busca de Alimentos</h4>
            <p>Ao clicar em "Adicionar Alimento", você pode:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Buscar por nome do alimento</li>
              <li>Filtrar por categoria (carnes, vegetais, etc.)</li>
              <li>Ajustar a quantidade em gramas</li>
              <li>Ver os valores nutricionais antes de adicionar</li>
            </ul>
          </div>

          <div className="bg-emerald-50 p-3 rounded-md border border-emerald-200">
            <p className="text-emerald-700"><strong>💡 Dica:</strong> Todas as suas alterações são salvas automaticamente no navegador. Você pode fechar e reabrir o app que seus dados estarão preservados!</p>
          </div>
        </div>
      </Card>

      <Card title="Como usar — Passo a passo" isDarkMode={isDarkMode}>
        <ol className="list-decimal pl-6 space-y-2 text-sm text-gray-900">
          <li>Crie suas refeições (ex.: Café da manhã, Almoço, Jantar). Renomeie, duplique ou exclua conforme necessário.</li>
          <li>Adicione alimentos à refeição. Você pode buscar por nome, filtrar por fontes e ajustar as quantidades em gramas.</li>
          <li>Edite quantidades diretamente na tabela; pressione Enter para salvar rapidamente.</li>
          <li>Acompanhe os totais de macros e calorias no painel à direita para manter o plano alinhado às suas metas.</li>
          <li>Use a checagem g/kg para avaliar distribuição relativa por peso corporal e ajuste o plano com base no resultado.</li>
        </ol>
      </Card>

      <Card title="Fontes de dados e créditos" isDarkMode={isDarkMode}>
        <div className="space-y-3 text-sm leading-6 text-gray-900">
          <p>Os dados de composição de alimentos do projeto são baseados especialmente nas tabelas brasileiras:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>TACO — Tabela Brasileira de Composição de Alimentos.</li>
            <li>TBCA — Tabela Brasileira de Composição de Alimentos (USP).</li>
          </ul>
          <p>Todo cuidado é tomado para garantir consistência e atualização gradual da base. Sugerimos sempre considerar contexto clínico e individual.</p>
        </div>
      </Card>

      <Card title="Gratuidade e apoio" isDarkMode={isDarkMode}>
        <div className="space-y-3 text-sm leading-6 text-gray-900">
          <p>Este projeto é e continuará sendo gratuito para profissionais de nutrição e para toda a população em geral.</p>
          <p>Se você quiser apoiar, basta me seguir em x.com/asiaticonutri ou instagram.com/asiaticonutri. Seu suporte ajuda a priorizar melhorias e novas funcionalidades.</p>
        </div>
      </Card>

      <Card title="Sugestões e feedback" isDarkMode={isDarkMode}>
        <div className="space-y-3 text-sm leading-6 text-gray-900">
          <p>
            Não encontrou um alimento e gostaria de vê-lo na nossa base? Avise em x.com, iremos validar e colocar na fila de próximas atualizações.
            Quer dar mais algum feedback? Sinta-se à vontade!
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Tutorial;

