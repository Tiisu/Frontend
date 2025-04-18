import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, BookOpen, Code, Lightbulb, Rocket, Send, Brain, Zap } from 'lucide-react';
import { ProjectData } from '@/lib/blockchain';
import { generateAIExplanation, ExplanationType, AIResponse } from '@/services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AIExplanationProps {
  project: ProjectData;
}

const AIExplanation: React.FC<AIExplanationProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<ExplanationType>('summary');
  const [customQuery, setCustomQuery] = useState('');
  const [responses, setResponses] = useState<Record<string, AIResponse>>({
    summary: { text: '', isLoading: false },
    technical: { text: '', isLoading: false },
    applications: { text: '', isLoading: false },
    future: { text: '', isLoading: false },
    custom: { text: '', isLoading: false }
  });

  const handleGenerateExplanation = async (type: ExplanationType) => {
    // Update loading state
    setResponses(prev => ({
      ...prev,
      [type]: { ...prev[type], isLoading: true, error: undefined }
    }));

    // Generate explanation
    const response = await generateAIExplanation(
      project,
      type,
      type === 'custom' ? customQuery : undefined
    );

    // Update response state
    setResponses(prev => ({
      ...prev,
      [type]: response
    }));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as ExplanationType);

    // If this tab doesn't have content yet, generate it
    const currentTab = value as ExplanationType;
    if (!responses[currentTab].text && !responses[currentTab].isLoading) {
      handleGenerateExplanation(currentTab);
    }
  };

  const handleCustomQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuery.trim()) {
      handleGenerateExplanation('custom');
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-white to-blue-50 border-university-blue/20 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-university-blue/10 to-university-gold/10 border-b pb-4">
        <CardTitle className="flex items-center text-2xl">
          <div className="bg-gradient-to-r from-university-blue to-university-gold p-2 rounded-lg mr-3">
            <Brain className="h-6 w-6 text-white" />
          </div>
          AI Insights
        </CardTitle>
        <CardDescription className="text-gray-600 mt-2">
          Get AI-powered explanations and insights about this project
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-5 mb-6 bg-gray-100/80 p-1 rounded-xl">
            <TabsTrigger value="summary" className="flex items-center rounded-lg data-[state=active]:bg-white data-[state=active]:text-university-blue data-[state=active]:shadow-md">
              <BookOpen className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Summary</span>
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center rounded-lg data-[state=active]:bg-white data-[state=active]:text-university-blue data-[state=active]:shadow-md">
              <Code className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Technical</span>
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center rounded-lg data-[state=active]:bg-white data-[state=active]:text-university-blue data-[state=active]:shadow-md">
              <Lightbulb className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Applications</span>
            </TabsTrigger>
            <TabsTrigger value="future" className="flex items-center rounded-lg data-[state=active]:bg-white data-[state=active]:text-university-blue data-[state=active]:shadow-md">
              <Rocket className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Future</span>
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center rounded-lg data-[state=active]:bg-white data-[state=active]:text-university-blue data-[state=active]:shadow-md">
              <Send className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Ask</span>
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="mt-0">
            <div className="min-h-[250px] bg-white rounded-xl p-6 shadow-inner border border-gray-100">
              {responses.summary.isLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-10">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-university-blue/20 animate-ping"></div>
                    <Loader2 className="h-10 w-10 animate-spin text-university-blue relative z-10" />
                  </div>
                  <p className="mt-4 text-university-blue/70 animate-pulse">Generating insights...</p>
                </div>
              ) : responses.summary.error ? (
                <div className="text-red-500">{responses.summary.error}</div>
              ) : responses.summary.text ? (
                <div className="prose prose-blue max-w-none">
                  <ReactMarkdown>{responses.summary.text}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-10">
                  <div className="bg-blue-50 rounded-full p-4 mb-4">
                    <Zap className="h-8 w-8 text-university-blue" />
                  </div>
                  <p className="text-gray-600 mb-4 text-center max-w-md">Generate an AI-powered summary of this project's key points and contributions</p>
                  <Button
                    onClick={() => handleGenerateExplanation('summary')}
                    className="bg-university-blue hover:bg-university-blue/90 shadow-md transition-all hover:shadow-lg"
                  >
                    Generate Summary
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="mt-0">
            <div className="min-h-[250px] bg-white rounded-xl p-6 shadow-inner border border-gray-100">
              {responses.technical.isLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-10">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-university-blue/20 animate-ping"></div>
                    <Loader2 className="h-10 w-10 animate-spin text-university-blue relative z-10" />
                  </div>
                  <p className="mt-4 text-university-blue/70 animate-pulse">Analyzing technical aspects...</p>
                </div>
              ) : responses.technical.error ? (
                <div className="text-red-500">{responses.technical.error}</div>
              ) : responses.technical.text ? (
                <div className="prose max-w-none">
                  <ReactMarkdown>{responses.technical.text}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-gray-500 mb-4">Generate a technical analysis of this project</p>
                  <Button
                    onClick={() => handleGenerateExplanation('technical')}
                    className="bg-university-blue hover:bg-university-blue/90"
                  >
                    Generate Technical Analysis
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="mt-0">
            <div className="min-h-[250px] bg-white rounded-xl p-6 shadow-inner border border-gray-100">
              {responses.applications.isLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-10">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-university-blue/20 animate-ping"></div>
                    <Loader2 className="h-10 w-10 animate-spin text-university-blue relative z-10" />
                  </div>
                  <p className="mt-4 text-university-blue/70 animate-pulse">Exploring applications...</p>
                </div>
              ) : responses.applications.error ? (
                <div className="text-red-500">{responses.applications.error}</div>
              ) : responses.applications.text ? (
                <div className="prose max-w-none">
                  <ReactMarkdown>{responses.applications.text}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-gray-500 mb-4">Explore practical applications of this project</p>
                  <Button
                    onClick={() => handleGenerateExplanation('applications')}
                    className="bg-university-blue hover:bg-university-blue/90"
                  >
                    Generate Applications
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Future Tab */}
          <TabsContent value="future" className="mt-0">
            <div className="min-h-[250px] bg-white rounded-xl p-6 shadow-inner border border-gray-100">
              {responses.future.isLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-10">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-university-blue/20 animate-ping"></div>
                    <Loader2 className="h-10 w-10 animate-spin text-university-blue relative z-10" />
                  </div>
                  <p className="mt-4 text-university-blue/70 animate-pulse">Predicting future directions...</p>
                </div>
              ) : responses.future.error ? (
                <div className="text-red-500">{responses.future.error}</div>
              ) : responses.future.text ? (
                <div className="prose max-w-none">
                  <ReactMarkdown>{responses.future.text}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-gray-500 mb-4">Explore future directions for this research</p>
                  <Button
                    onClick={() => handleGenerateExplanation('future')}
                    className="bg-university-blue hover:bg-university-blue/90"
                  >
                    Generate Future Directions
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Custom Query Tab */}
          <TabsContent value="custom" className="mt-0">
            <div className="min-h-[250px] bg-white rounded-xl p-6 shadow-inner border border-gray-100">
              <form onSubmit={handleCustomQuery} className="mb-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask a specific question about this project..."
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    className="flex-1 border-university-blue/20 focus:border-university-blue focus:ring-university-blue/30"
                  />
                  <Button
                    type="submit"
                    className="bg-university-blue hover:bg-university-blue/90 shadow-md transition-all hover:shadow-lg"
                    disabled={!customQuery.trim() || responses.custom.isLoading}
                  >
                    {responses.custom.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>

              {responses.custom.isLoading ? (
                <div className="flex flex-col items-center justify-center h-32 py-10">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-university-blue/20 animate-ping"></div>
                    <Loader2 className="h-10 w-10 animate-spin text-university-blue relative z-10" />
                  </div>
                  <p className="mt-4 text-university-blue/70 animate-pulse">Finding answers...</p>
                </div>
              ) : responses.custom.error ? (
                <div className="text-red-500">{responses.custom.error}</div>
              ) : responses.custom.text ? (
                <div className="prose max-w-none">
                  <ReactMarkdown>{responses.custom.text}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32">
                  <p className="text-gray-500">
                    Ask any question about this project to get AI-generated insights
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-gray-500 border-t pt-4 bg-gray-50">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <Sparkles className="h-3 w-3 mr-1 text-university-gold" />
            AI-generated content may contain inaccuracies. Always verify important information.
          </div>
          <div className="text-university-blue/70 flex items-center">
            <Brain className="h-3 w-3 mr-1" />
            Powered by Gemini AI
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIExplanation;
