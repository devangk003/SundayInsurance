import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase-config";
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
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Insurance Quotes</h2>
        {vehicleRegistration && (
          <p className="text-lg text-gray-600 mb-2">Vehicle: {vehicleRegistration}</p>
        )}
        <p className="text-sm text-gray-500 mb-4">Found {quotes.length} quote{quotes.length !== 1 ? 's' : ''} from top insurers</p>
        <Button 
          onClick={onNewQuote}
          variant="outline"
          className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-full"
        >
          Get New Quote
        </Button>
        {user && (
          <Button onClick={handleLogout} className="ml-4" variant="destructive">Logout</Button>
        )}
      </div>

      {/* Logo-focused grid layout */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quotes.map((quote) => (
          <Card key={quote.quoteNumber} className="shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              {/* Logo Section - Primary Focus */}
              <div className="flex justify-center mb-4">
                {quote.logoUrl && quote.logoUrl !== 'No logo available' ? (
                  <div className="w-20 h-20 flex items-center justify-center bg-white rounded-xl border-2 border-gray-100 p-3 shadow-sm">
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
                  className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl border-2 border-emerald-200 flex items-center justify-center shadow-sm"
                  style={{ display: quote.logoUrl && quote.logoUrl !== 'No logo available' ? 'none' : 'flex' }}
                >
                  <span className="text-lg font-bold text-emerald-700">
                    {quote.insurer.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Premium - Main Focus */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-emerald-600 mb-1">{quote.premium}</div>
                <div className="text-sm text-gray-500">Annual Premium</div>
              </div>

              {/* IDV and Plan Type */}
              <div className="mb-4 space-y-2">
                <div>
                  <div className="text-lg font-semibold text-gray-800">IDV: {quote.idv}</div>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 px-3 py-1">
                  {quote.planType}
                </Badge>
              </div>

              {/* NCB if available */}
              {quote.details?.ncb && quote.details.ncb !== 'Not available' && (
                <div className="mb-4 p-2 bg-emerald-50 rounded-lg">
                  <span className="text-sm font-medium text-emerald-700">
                    NCB: {quote.details.ncb}
                  </span>
                </div>
              )}

              {/* Quote Number */}
              <div className="mb-4 text-xs text-gray-400">
                Quote #{quote.quoteNumber}
              </div>

              {/* Action Button */}
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg">
                View Details
              </Button>

              {/* Details Section - Collapsible */}
              {quote.details && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="space-y-2 text-sm text-gray-600">
                    {quote.details.paCover && quote.details.paCover !== 'Not available' && (
                      <div className="flex justify-between">
                        <span>PA Cover:</span>
                        <span className="font-medium">{quote.details.paCover}</span>
                      </div>
                    )}
                    {quote.details.tenure && quote.details.tenure !== 'Not available' && (
                      <div className="flex justify-between">
                        <span>Tenure:</span>
                        <span className="font-medium">{quote.details.tenure}</span>
                      </div>
                    )}
                    {quote.details.paymentMethod && quote.details.paymentMethod !== 'Not available' && (
                      <div className="flex justify-between">
                        <span>Payment:</span>
                        <span className="font-medium">{quote.details.paymentMethod}</span>
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
