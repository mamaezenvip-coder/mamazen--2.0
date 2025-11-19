/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { KeyIcon } from './icons';

interface ApiKeyDialogProps {
  onContinue: () => void;
  // Optional prop for dynamic error messages
  errorMessage?: string | null; 
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onContinue, errorMessage }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center flex flex-col items-center border border-pink-100">
        <div className="bg-primary/20 p-4 rounded-full mb-6 animate-pulse-slow">
          <KeyIcon className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">API Key Necessária</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Para usar alguns recursos da IA, por favor, selecione uma chave de API associada a um projeto Google Cloud pago com faturamento ativado.
        </p>
        {errorMessage && (
            <p className="text-red-500 font-medium mb-4">{errorMessage}</p>
        )}
        <p className="text-gray-500 mb-8 text-sm">
          Para mais informações, consulte a{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            documentação de faturamento
          </a>.
        </p>
        <button
          onClick={onContinue}
          className="w-full px-6 py-3 bg-primary hover:bg-pink-600 text-white font-semibold rounded-2xl transition-colors text-lg shadow-lg shadow-pink-200"
        >
          Continuar para Selecionar Chave de API Paga
        </button>
      </div>
    </div>
  );
};

export default ApiKeyDialog;