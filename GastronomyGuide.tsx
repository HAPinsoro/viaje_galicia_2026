import React, { useState } from 'react';
import { ALL_POIS } from '../data/galiciaRouteData';
import { PointOfInterest } from '../types/trip';
import {
  Utensils,
  Wine,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface GastronomyGuideProps {
  onSelectPoi?: (poi: PointOfInterest) => void;
}

export const GastronomyGuide: React.FC<GastronomyGuideProps> = ({ onSelectPoi }) => {
  const { language, getLocalizedPoi } = useLanguage();
  const isFr = language === 'fr';

  const gastroPois = ALL_POIS.filter((p) => p.category === 'gastro').map((spot) =>
    getLocalizedPoi(spot)
  );
  const [, setAiLocation] = useState('');
  const [, setAiDish] = useState('');

  const galicianDishes = [
    {
      name: isFr ? 'Poulpe à la Galicienne (Polbo á Feira)' : 'Pulpo á Feira',
      description: isFr
        ? 'Cuit au chaudron de cuivre traditionnel avec pimentón fumé, fleur de sel et huile d\'olive vierge extra sur lit de pommes de terre (cachelos).'
        : 'Cocido en caldero de cobre tradicional con pimentón de la Vera picante/dulce, flor de sal y AOVE sobre cachelos.',
      where: isFr ? 'Ourense (Rúa dos Viños), Lugo (Praza do Campo) et Saint-Jacques.' : 'Ourense (Rúa dos Viños), Lugo (Praza do Campo) y Santiago.',
      icon: '🐙',
    },
    {
      name: isFr ? 'Fruits de Mer des Rías (Huîtres, Couteaux, Pétoncles, Pouce-pieds)' : 'Mariscos de las Rías (Ostras, Navajas, Zamburiñas, Percebes)',
      description: isFr
        ? 'Pêche ultra fraîche à marée basse et parcs d\'élevage de la Ría d\'Arousa et Ría de Vigo.'
        : 'Producto vivo de bajamar y bateas de la Ría de Arousa y Ría de Vigo.',
      where: isFr ? 'Vigo (A Pedra), O Grove, Cambados et Fisterra.' : 'Vigo (A Pedra), O Grove, Cambados y Fisterra.',
      icon: '🦪',
    },
    {
      name: isFr ? 'Véritable Omelette de Betanzos' : 'Auténtica Tortilla de Betanzos',
      description: isFr
        ? 'Pommes de terre galiciennes finement confites, œufs fermiers et cœur délicieusement crémeux/baveux sans oignon.'
        : 'Patata gallega pochada fina, huevos camperos y punto meloso inigualable sin cebolla.',
      where: isFr ? 'Betanzos (Mesón O Pote, Casa Miranda).' : 'Betanzos (Mesón O Pote, Casa Miranda).',
      icon: '🍳',
    },
    {
      name: isFr ? 'Piments de Padrón (Herbón)' : 'Pimientos de Padrón (Herbón)',
      description: isFr
        ? '"Certains piquent, d\'autres non". Sautés à feu très vif et assaisonnés de gros sel marin.'
        : '"Uns pican e outros non". Fritos a fuego vivo y rematados con sal gruesa.',
      where: isFr ? 'Padrón et Saint-Jacques-de-Compostelle.' : 'Padrón y Santiago de Compostela.',
      icon: '🌶️',
    },
    {
      name: isFr ? 'Empanada Galicienne Artisanale' : 'Empanada Gallega Artesanal',
      description: isFr
        ? 'Pâte fine garnie de pétoncles, coques, morue aux raisins secs ou porc mariné (zorza).'
        : 'Masa fina de maíz o trigo rellena de zamburiñas, berberechos, bacalao con pasas o zorza.',
      where: isFr ? 'Marché couvert d\'Abastos à Saint-Jacques, Cambados et Lugo.' : 'Mercado de Abastos de Santiago, Cambados y Lugo.',
      icon: '🥧',
    },
    {
      name: isFr ? 'Bœuf Rubia Gallega & Côte de Bœuf' : 'Carne Rubia Gallega & Chuletón',
      description: isFr
        ? 'Bœuf suprême de race galicienne affiné et grillé à la braise, ou viande mijotée au chaudron.'
        : 'Ternera suprema gallega a la brasa y carne ao caldeiro con unto.',
      where: isFr ? 'Lugo, Ourense et terroir intérieur galicien.' : 'Lugo, Ourense e interior gallego.',
      icon: '🥩',
    },
  ];

  const winePairings = [
    {
      name: 'D.O. Rías Baixas (Albariño)',
      profile: isFr
        ? 'Blanc vif, minéral et salin aux arômes d\'agrumes et de pêche blanche. Accord parfait pour les fruits de mer.'
        : 'Blanco fresco y cítrico con notas marinas. Maridaje perfecto para marisco.',
    },
    {
      name: 'D.O. Ribeira Sacra (Mencía)',
      profile: isFr
        ? 'Rouge élégant et fruité issu de la viticulture héroïque sur les pentes vertigineuses des canyons du Sil.'
        : 'Tinto elegante de viticultura heroica en los cañones del río Sil.',
    },
    {
      name: 'D.O. Ribeiro (Treixadura)',
      profile: isFr
        ? 'Blanc aromatique et corsé, traditionnellement servi dans le bol en faïence blanche (cunca).'
        : 'Blanco vivaz con cuerpo, servido tradicionalmente en cunca.',
    },
    {
      name: 'D.O. Valdeorras (Godello)',
      profile: isFr
        ? 'Blanc structuré, minéral et floral, idéal avec poissons nobles et viandes blanches.'
        : 'Blanco estructurado y mineral con notas frutales.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#0F0F0F] border border-slate-800 rounded-xl p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              {isFr ? 'Guide Gastronomique & Vins' : 'Guía Gastronómica & Vinos'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isFr ? 'Escales Culinaires & Tapas des 10 Jours' : 'Paradas Culinarias & Tapas de los 10 Días'}
            </h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
          {isFr
            ? 'Sélection soignée de pulperías authentiques, marisquerías de criée et auberges traditionnelles pour 2 couples (4 personnes).'
            : 'Recomendaciones curadas de pulperías tradicionales, marisquerías de lonja y tascas con recetas locales para 2 parejas (4 personas).'}
        </p>
      </div>

      {/* 6 Essential Iconic Dishes */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>{isFr ? 'Plats Incontournables à Partager en Groupe' : 'Platos Estrella para Pedir en Grupo'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {galicianDishes.map((dish, i) => (
            <div
              key={i}
              className="bg-[#0F0F0F] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">{dish.icon}</span>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide">{dish.name}</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {dish.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                📍 <span className="text-slate-300">{dish.where}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Curated Taverns Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-2">
          <Utensils className="w-4 h-4 text-amber-400" />
          <span>{isFr ? 'Restaurants & Tavernes Sélectionnés' : 'Restaurantes & Tabernas Seleccionadas'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gastroPois.map((spot) => (
            <div
              key={spot.id}
              onClick={() => onSelectPoi?.(spot)}
              className="bg-[#0F0F0F] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-blue-400 bg-[#141414] px-2 py-0.5 rounded border border-slate-800">
                      {isFr ? `Jour ${spot.dayNumber}` : `Día ${spot.dayNumber}`}
                    </span>
                    <h4 className="text-sm sm:text-base font-semibold text-white mt-1 group-hover:text-blue-400 transition-colors">
                      {spot.name}
                    </h4>
                  </div>

                  <div className="flex text-yellow-500 text-xs">★★★★★</div>
                </div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {spot.description}
                </p>

                {spot.dishRecommendations && (
                  <div className="mt-3 bg-[#141414] p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider block mb-1">
                      {isFr ? 'Suggestions de Plats (4 pers.) :' : 'Comanda Sugerida (4 pax):'}
                    </span>
                    <p className="text-xs text-slate-300">
                      {spot.dishRecommendations.join(' • ')}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800 text-xs font-mono">
                <span className="text-[11px] text-slate-500 truncate max-w-[220px]">
                  {spot.address}
                </span>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    spot.name + ' ' + spot.address
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 text-[11px]"
                >
                  <span>Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wine Regions */}
      <div className="bg-[#0F0F0F] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-2">
          <Wine className="w-4 h-4 text-purple-400" />
          <span>{isFr ? 'Appellations d\'Origine Contrôlée (D.O.) du Circuit' : 'Denominaciones de Origen de la Ruta'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {winePairings.map((wine, index) => (
            <div
              key={index}
              className="bg-[#141414] p-3 rounded-lg border border-slate-800 space-y-1"
            >
              <h4 className="text-xs font-bold text-white font-mono uppercase">{wine.name}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {wine.profile}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
