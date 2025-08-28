import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { convertNumber, type ConversionResult } from '@/lib/number-converter';
import { Copy, Calculator, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EXAMPLE_INPUTS = [
  '$1.5K',
  '€2.5M',
  '£750K',
  '1000000',
  '¥150B',
  '42.7K'
];

export function NumberConverter() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (input.trim()) {
      const converted = convertNumber(input);
      setResult(converted);
    } else {
      setResult(null);
    }
  }, [input]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-primary">
                <Calculator className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Number Converter
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Intelligently convert between shorthand notations (1K, 2.5M) and full numbers, 
              with currency support and text representations.
            </p>
          </div>

          {/* Input Section */}
          <Card className="p-6 mb-8 shadow-elegant">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter a number (e.g., $1.5K, 2500000, €750K)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="text-lg h-14 pl-4 pr-12 font-medium"
                />
                <TrendingUp className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
              
              {/* Example buttons */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground mr-2">Try examples:</span>
                {EXAMPLE_INPUTS.map((example) => (
                  <Button
                    key={example}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(example)}
                    className="text-xs"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Results Section */}
          {result && (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Full Number */}
              <Card className="p-6 shadow-soft transition-all duration-300 hover:shadow-elegant">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Full Number
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.numericValue.toString(), 'Full number')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-mono font-bold text-foreground">
                      {result.currency || ''}{formatNumber(result.numericValue)}
                    </p>
                    {result.isValid && (
                      <Badge variant="secondary" className="text-xs">
                        {result.numericValue >= 0 ? 'Positive' : 'Negative'}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>

              {/* Shorthand Format */}
              <Card className="p-6 shadow-soft transition-all duration-300 hover:shadow-elegant">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Shorthand
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.shorthandForm, 'Shorthand')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-mono font-bold text-primary">
                      {result.shorthandForm}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Compact Format
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Words Format */}
              <Card className="p-6 shadow-soft transition-all duration-300 hover:shadow-elegant md:col-span-1">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      In Words
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.wordsForm, 'Words format')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-foreground capitalize leading-relaxed">
                      {result.wordsForm}
                    </p>
                    {result.currency && (
                      <Badge variant="secondary" className="text-xs">
                        Currency: {result.currency}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Error State */}
          {result && !result.isValid && (
            <Card className="p-6 border-destructive/50 bg-destructive/5">
              <p className="text-destructive text-center">
                Invalid input. Please enter a valid number or shorthand notation.
              </p>
            </Card>
          )}

          {/* Empty State */}
          {!input && (
            <Card className="p-12 text-center border-dashed">
              <Calculator className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">Ready to Convert</h3>
              <p className="text-muted-foreground">
                Enter a number above to see the conversion in different formats
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}