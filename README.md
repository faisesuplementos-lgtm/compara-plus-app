
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import { SearchResult, AppStatus, Tab, MarketplaceOption } from './types';
import { searchProduct } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [currentSearch, setCurrentSearch] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceOption | null>(null);
  const [favorites, setFavorites] = useState<MarketplaceOption[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('compara_plus_favorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  useEffect(() => {
    localStorage.setItem('compara_plus_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleSearch = async (query: string) => {
    setCurrentSearch(query);
    setStatus(AppStatus.SEARCHING);
    setResults(null);
    setSelectedProduct(null);
    setActiveTab(Tab.PRICES);
    
    try {
      const data = await searchProduct(query);
      if (data) {
        setResults(data);
        setStatus(AppStatus.SUCCESS);
      } else {
        setStatus(AppStatus.NOT_FOUND);
      }
    } catch (error) {
      setStatus(AppStatus.ERROR);
    }
  };

  const toggleFavorite = (product: MarketplaceOption) => {
    setFavorites(prev => {
      const isFav = prev.find(p => p.link === product.link);
      if (isFav) return prev.filter(p => p.link !== product.link);
      return [...prev, product];
    });
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="min-h-screen bg-[#f1f3f8] pb-32 font-sans text-gray-900 overflow-x-hidden">
      {activeTab === Tab.HOME && !selectedProduct && (
        <>
          <Header onSearch={handleSearch} isLoading={status === AppStatus.SEARCHING} />
          <main className="max-w-md mx-auto px-6 mt-6">
            <div className="animate-fade-in">
              {/* Savings Banner */}
              <div className="bg-white rounded-2xl p-6 mb-6 flex items-center justify-between border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="flex-1 pr-2 relative z-10">
                  <h2 className="text-gray-900 font-bold text-lg leading-tight">
                    Economize com o <span className="text-[#1e4eb8]">Compara+</span>
                  </h2>
                  <p className="text-gray-600 text-xs mt-1">Ache o menor preço em segundos!</p>
                </div>
                <div className="w-20 h-16 flex-shrink-0">
                  <img src="https://ouch-cdn2.icons8.com/mS2uCg5l9uW7M5V8z0Y6yD5m3V0hL8y-p4z3I0U6Q0g/rs:fit:256:256/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvNzEw/LzI3Y2ZjYjY0LWQ4/YjctNDRhOC1hMzk1/LWZiN2U1MWM0YmM0/MC5zdmc.png" className="w-full h-full object-contain" alt="shopping bags" />
                </div>
              </div>

              {/* Suggestions List */}
              <div className="space-y-3">
                <div 
                  onClick={() => handleSearch('iPhone 13')}
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-50 cursor-pointer active:scale-95 transition-all"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center p-2">
                    <img src="https://m.media-amazon.com/images/I/41-N6N237DL._AC_SL1000_.jpg" className="w-full h-full object-contain" alt="iPhone" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 font-bold text-sm">iPhone 13</h3>
                    <p className="text-gray-500 text-xs mt-1">A partir de <span className="text-gray-900 font-black">R$ 2.799</span></p>
                  </div>
                </div>

                <div 
                  onClick={() => handleSearch('Fone Bluetooth')}
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-50 cursor-pointer active:scale-95 transition-all"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center p-2">
                    <img src="https://m.media-amazon.com/images/I/418B5B1621L._AC_SL1000_.jpg" className="w-full h-full object-contain" alt="Fones" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 font-bold text-sm">Fones Bluetooth</h3>
                    <p className="text-gray-500 text-xs mt-1">A partir de <span className="text-gray-900 font-black">R$ 129</span></p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </>
      )}

      {/* Other screens (Prices, Search results, etc) */}
      {activeTab === Tab.PRICES && !selectedProduct && (
        <main className="max-w-md mx-auto px-6 mt-6">
           <Header onSearch={handleSearch} isLoading={status === AppStatus.SEARCHING} />
           <div className="mt-6">
             {status === AppStatus.SEARCHING ? (
               <div className="py-20 text-center">
                 <div className="inline-block w-8 h-8 border-3 border-[#1e4eb8] border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Buscando...</p>
               </div>
             ) : results ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                   <ProductCard option={results.bestOption} isBest={true} onClick={() => setSelectedProduct(results.bestOption)} />
                   {results.others.map((opt, i) => (
                     <ProductCard key={i} option={opt} onClick={() => setSelectedProduct(opt)} />
                   ))}
                </div>
             ) : (
               <div className="text-center py-20">
                 <p className="text-gray-400 text-sm">Nenhum resultado para exibir.</p>
               </div>
             )}
           </div>
        </main>
      )}

      {selectedProduct && (
        <div className="max-w-md mx-auto px-6 mt-8">
          <button onClick={() => setSelectedProduct(null)} className="mb-6 text-[#1e4eb8] font-bold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
            Voltar
          </button>
          <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
            <img src={selectedProduct.imageUrl || 'https://picsum.photos/400'} className="w-48 h-48 mx-auto object-contain mb-6" alt="" />
            <h3 className="font-bold text-xl mb-2">{selectedProduct.productName}</h3>
            <p className="text-2xl font-black text-[#1e4eb8] mb-6">{formatCurrency(selectedProduct.finalPrice)}</p>
            <a href={selectedProduct.link} target="_blank" rel="noopener noreferrer" className="block w-full bg-[#1e4eb8] text-white py-4 rounded-xl font-bold uppercase">Ver na Loja</a>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50 pb-safe">
        <button onClick={() => {setActiveTab(Tab.HOME); setSelectedProduct(null);}} className={`flex flex-col items-center gap-1 ${activeTab === Tab.HOME ? 'text-[#1e4eb8]' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button onClick={() => {setActiveTab(Tab.PRICES); setSelectedProduct(null);}} className={`flex flex-col items-center gap-1 ${activeTab === Tab.PRICES ? 'text-[#1e4eb8]' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-1 16H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2z" /></svg>
          <span className="text-[10px] font-bold">Preços</span>
        </button>
        <button onClick={() => setActiveTab(Tab.FAVORITES)} className={`flex flex-col items-center gap-1 ${activeTab === Tab.FAVORITES ? 'text-[#1e4eb8]' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span className="text-[10px] font-bold">Favoritos</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-400">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
          <span className="text-[10px] font-bold">Lojas</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
