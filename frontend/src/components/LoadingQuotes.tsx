import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingQuotesProps {
  message?: string;
}

const LoadingQuotes: React.FC<LoadingQuotesProps> = ({ 
  message = "Fetching your insurance quotes..." 
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-6">
            {/* Animated loading spinner */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-emerald-400 rounded-full animate-spin animation-delay-150"></div>
            </div>

            {/* Loading message */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">{message}</h3>
              <p className="text-gray-600">This may take 30-60 seconds</p>
            </div>

            {/* Loading steps */}
            <div className="w-full max-w-md space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Analyzing your vehicle details</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-emerald-300 rounded-full animate-pulse animation-delay-300"></div>
                <span className="text-sm text-gray-600">Comparing insurance providers</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-emerald-200 rounded-full animate-pulse animation-delay-500"></div>
                <span className="text-sm text-gray-600">Calculating best quotes</span>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="w-full max-w-md">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full animate-pulse" style={{width: '45%'}}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingQuotes;
