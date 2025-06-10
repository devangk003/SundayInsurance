import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InsuranceQuote } from "@/services/api";

interface QuoteResultsProps {
  quotes: InsuranceQuote[];
  vehicleRegistration?: string;
  onNewQuote: () => void;
}

const QuoteResults: React.FC<QuoteResultsProps> = ({ quotes, vehicleRegistration, onNewQuote }) => {
  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Liquid Glass Header */}
      <div 
        className="mb-8 text-center p-6 rounded-3xl relative"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(255, 255, 255, 0.05)
          `
        }}
      >
        {/* Liquid Glass Inner Glow */}
        <div 
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: `
              linear-gradient(135deg, 
                rgba(255, 255, 255, 0.1) 0%, 
                rgba(255, 255, 255, 0.05) 25%, 
                transparent 50%, 
                rgba(255, 255, 255, 0.03) 75%, 
                rgba(255, 255, 255, 0.08) 100%
              )
            `
          }}
        />
        
        <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Insurance Quotes</h2>
        {vehicleRegistration && (
          <p className="text-lg text-cyan-200 mb-2 relative z-10">Vehicle: {vehicleRegistration}</p>
        )}
        <p className="text-sm text-slate-300 mb-4 relative z-10">
          Found {quotes.length} quote{quotes.length !== 1 ? 's' : ''} from top insurers
        </p>
        <Button 
          onClick={onNewQuote}
          className="relative z-10 px-6 py-3 rounded-full text-white transition-all duration-300 transform hover:scale-105"
          style={{
            background: 'rgba(59, 130, 246, 0.2)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: `
              0 8px 25px rgba(59, 130, 246, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `
          }}
        >
          Get New Quote
        </Button>
      </div>      {/* Liquid Glass Quote Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quotes.map((quote) => (
          <Card 
            key={quote.quoteNumber} 
            className="overflow-hidden transition-all duration-300 hover:scale-105 border-0 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.25),
                inset 0 1px 0 rgba(255, 255, 255, 0.2),
                inset 0 -1px 0 rgba(255, 255, 255, 0.05)
              `
            }}
          >
            <CardContent className="p-6 text-center relative">
              {/* Liquid Glass Inner Glow */}
              <div 
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(255, 255, 255, 0.08) 0%, 
                      rgba(255, 255, 255, 0.04) 25%, 
                      transparent 50%, 
                      rgba(255, 255, 255, 0.02) 75%, 
                      rgba(255, 255, 255, 0.06) 100%
                    )
                  `
                }}
              />
              
              {/* Logo Section */}
              <div className="flex justify-center mb-4 relative z-10">
                {quote.logoUrl && quote.logoUrl !== 'No logo available' ? (
                  <div 
                    className="w-20 h-20 flex items-center justify-center rounded-xl p-3"
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <img 
                      src={quote.logoUrl} 
                      alt="Insurance company logo"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  </div>
                ) : null}
                {/* Fallback for missing/failed logos */}
                <div 
                  className="w-20 h-20 rounded-xl flex items-center justify-center"
                  style={{ 
                    display: quote.logoUrl && quote.logoUrl !== 'No logo available' ? 'none' : 'flex',
                    background: 'rgba(16, 185, 129, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <span className="text-lg font-bold text-emerald-300">
                    {quote.insurer.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Premium - Main Focus */}
              <div className="mb-4 relative z-10">
                <div className="text-3xl font-bold text-emerald-400 mb-1">{quote.premium}</div>
                <div className="text-sm text-slate-300">Annual Premium</div>
              </div>

              {/* IDV and Plan Type */}
              <div className="mb-4 space-y-2 relative z-10">
                <div>
                  <div className="text-lg font-semibold text-white">IDV: {quote.idv}</div>
                </div>
                <Badge 
                  className="px-3 py-1 border-0"
                  style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#60a5fa'
                  }}
                >
                  {quote.planType}
                </Badge>
              </div>

              {/* NCB if available */}
              {quote.details?.ncb && quote.details.ncb !== 'Not available' && (
                <div 
                  className="mb-4 p-2 rounded-lg relative z-10"
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <span className="text-sm font-medium text-emerald-300">
                    NCB: {quote.details.ncb}
                  </span>
                </div>
              )}

              {/* Quote Number */}
              <div className="mb-4 text-xs text-slate-400 relative z-10">
                Quote #{quote.quoteNumber}
              </div>

              {/* Action Button */}
              <Button 
                className="w-full py-2 rounded-xl text-white transition-all duration-300 transform hover:scale-105 relative z-10"
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  boxShadow: `
                    0 8px 25px rgba(16, 185, 129, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                View Details
              </Button>

              {/* Details Section - Liquid Glass */}
              {quote.details && (
                <div 
                  className="mt-4 pt-4 relative z-10"
                  style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="space-y-2 text-sm text-slate-300">
                    {quote.details.paCover && quote.details.paCover !== 'Not available' && (
                      <div className="flex justify-between">
                        <span>PA Cover:</span>
                        <span className="font-medium text-white">{quote.details.paCover}</span>
                      </div>
                    )}
                    {quote.details.tenure && quote.details.tenure !== 'Not available' && (
                      <div className="flex justify-between">
                        <span>Tenure:</span>
                        <span className="font-medium text-white">{quote.details.tenure}</span>
                      </div>
                    )}
                    {quote.details.paymentMethod && quote.details.paymentMethod !== 'Not available' && (
                      <div className="flex justify-between">
                        <span>Payment:</span>
                        <span className="font-medium text-white">{quote.details.paymentMethod}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuoteResults;
