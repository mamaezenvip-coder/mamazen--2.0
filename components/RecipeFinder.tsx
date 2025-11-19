/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { generateRecipe } from '../services/geminiService';
import { Recipe } from '../types';
import { SparklesIcon, SearchIcon } from './icons';

const RecipeFinder: React.FC = () => {
  const [query, setQuery] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setRecipe(null);
    try {
      const result = await generateRecipe(query);
      setRecipe(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to trigger search for quick tags
  const handleTagClick = (tag: string) => {
      setQuery(tag);
      // Manually trigger logic since state update is async for the form submit
      setLoading(true);
      setRecipe(null);
      generateRecipe(tag).then(res => {
          setRecipe(res);
          setLoading(false);
      });
  };

  const quickTags = [
    'Dormir melhor',
    'Cólica do bebê',
    'Aumentar leite'
  ];

  return (
    <div className="p-4 pb-24 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">Mestre Culinário</h2>
        <p className="text-gray-500">Receitas funcionais para o que você sente.</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: Cólica, Dormir..." 
            className="w-full bg-white border-none shadow-md rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 outline-none text-gray-700"
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <button type="submit" className="hidden">Search</button>
      </form>

      {!recipe && !loading && (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Sugestões Rápidas (Offline)</h3>
            <div className="flex flex-wrap gap-2">
                {quickTags.map(tag => (
                    <button 
                        key={tag} 
                        onClick={() => handleTagClick(tag)}
                        className="bg-white px-4 py-2 rounded-full text-sm text-gray-600 shadow-sm hover:bg-pink-50 hover:text-primary transition-colors"
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-primary">
            <SparklesIcon className="w-10 h-10 animate-spin mb-4" />
            <p>O Chef IA está criando sua receita...</p>
        </div>
      )}

      {recipe && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in">
            <div className="h-2 bg-green-400"></div>
            <div className="p-6 space-y-6">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">{recipe.title}</h3>
                    <p className="text-gray-500 mt-1 italic">{recipe.description}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl text-green-800 text-sm">
                    <span className="font-bold">💡 Benefício:</span> {recipe.benefits}
                </div>

                <div className="space-y-3">
                    <h4 className="font-bold text-gray-700 flex items-center gap-2">Ingredientes</h4>
                    <ul className="space-y-2">
                        {recipe.ingredients.map((ing, i) => (
                            <li key={i} className="flex items-center gap-2 text-gray-600">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                {ing}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-3">
                    <h4 className="font-bold text-gray-700">Modo de Preparo</h4>
                    <div className="space-y-4">
                        {recipe.instructions.map((step, i) => (
                            <div key={i} className="flex gap-4">
                                <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                    {i + 1}
                                </span>
                                <p className="text-gray-600 text-sm leading-relaxed">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default RecipeFinder;