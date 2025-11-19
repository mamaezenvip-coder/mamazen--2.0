/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Preparando a magia da IA...",
  "Consultando a base de conhecimento...",
  "Ajustando os algoritmos...",
  "Pensando em uma resposta perfeita...",
  "Organizando ideias inovadoras...",
  "Um momento, por favor!",
  "Quase lá...",
  "Conectando os pontos...",
  "O Mamãe Zen está trabalhando para você...",
  "Gerando informações úteis...",
];

const LoadingIndicator: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-xl border border-pink-100 text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75"></div>
        <div className="w-20 h-20 border-4 border-t-transparent border-primary rounded-full animate-spin relative z-10"></div>
      </div>
      <h2 className="text-2xl font-bold mt-4 text-gray-800">Processando...</h2>
      <p className="mt-2 text-gray-600 text-sm transition-opacity duration-500">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingIndicator;