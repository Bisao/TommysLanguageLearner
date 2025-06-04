import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Menu, X, Globe, RotateCcw } from "lucide-react";

interface HeaderProps {
  progress: number;
  onToggleTranslation: () => void;
  showTranslations: boolean;
}

export function Header({ progress, onToggleTranslation, showTranslations }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {/* Tommy's Academy Logo */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white">
                <img 
                  src="/attached_assets/Screenshot_2025-06-04_015828-removebg-preview.png" 
                  alt="Tommy's Academy Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tommy's Academy</h1>
                <p className="text-sm text-gray-500">Aprendizado Interativo de Inglês</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#lessons" className="text-gray-600 hover:text-blue-600 transition-colors">Aulas</a>
              <a href="#exercises" className="text-gray-600 hover:text-blue-600 transition-colors">Exercícios</a>
              <a href="#progress" className="text-gray-600 hover:text-blue-600 transition-colors">Progresso</a>
              
              {/* Progress Indicator */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Progresso:</span>
                <div className="w-24">
                  <Progress value={progress} className="h-2" />
                </div>
                <span className="text-sm font-medium text-blue-600">{progress}%</span>
              </div>
              
              {/* Translation Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleTranslation}
                className={`${showTranslations ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                <Globe className="h-4 w-4 mr-2" />
                {showTranslations ? 'Ocultar Traduções' : 'Mostrar Traduções'}
              </Button>
            </nav>
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-3 space-y-2">
            <a href="#lessons" className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md">Aulas</a>
            <a href="#exercises" className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md">Exercícios</a>
            <a href="#progress" className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md">Progresso</a>
            
            {/* Mobile Progress */}
            <div className="flex items-center space-x-2 px-3 py-2">
              <span className="text-sm text-gray-600">Progresso:</span>
              <div className="flex-1">
                <Progress value={progress} className="h-2" />
              </div>
              <span className="text-sm font-medium text-blue-600">{progress}%</span>
            </div>
            
            {/* Mobile Translation Toggle */}
            <div className="px-3 py-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleTranslation}
                className={`w-full ${showTranslations ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                <Globe className="h-4 w-4 mr-2" />
                {showTranslations ? 'Ocultar Traduções' : 'Mostrar Traduções'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
