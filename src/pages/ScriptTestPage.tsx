/**
 * Script Test Page
 * 
 * Interactive demo showing the comprehensive sales script with embedded objections.
 * This demonstrates how objections are always visible and change as the conversation progresses.
 */

import { useState } from 'react';
import ComprehensiveScriptDemo from '@/components/ComprehensiveScriptDemo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, ArrowLeft } from '@phosphor-icons/react';
import type { CultureType } from '@/lib/types/enhancedScriptTypes';

export default function ScriptTestPage() {
  const [selectedCulture, setSelectedCulture] = useState<CultureType>('arab');
  const [showDemo, setShowDemo] = useState(false);

  if (!showDemo) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <Card className="p-8">
          <div className="text-center space-y-6">
            <div>
              <Badge className="mb-4 text-lg px-4 py-2">COMPREHENSIVE SCRIPT TEST</Badge>
              <h1 className="text-4xl font-bold mb-4">
                Interactive Sales Script Demo
              </h1>
              <p className="text-lg text-muted-foreground">
                Experience the new comprehensive sales script with embedded objections
              </p>
            </div>

            <div className="bg-primary/5 p-6 rounded-lg space-y-4 text-left">
              <h2 className="text-xl font-semibold">What You'll See:</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <span className="font-semibold">Embedded Objections:</span> Always visible in the right panel,
                    ready for instant response as conversation progresses
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <span className="font-semibold">Multiple Response Options:</span> Each objection has 2-3 
                    different approaches with success rates
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <span className="font-semibold">Expected Client Responses:</span> See predicted responses 
                    with probability percentages
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <span className="font-semibold">Cultural Adaptations:</span> Switch between Arab, Indian, 
                    and Western client approaches
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <span className="font-semibold">Real-time Flow:</span> Watch how the script changes as you 
                    handle objections and progress through sections
                  </div>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Choose Client Culture:</h2>
              <Tabs value={selectedCulture} onValueChange={(value) => setSelectedCulture(value as CultureType)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="arab">Arab Client</TabsTrigger>
                  <TabsTrigger value="indian">Indian Client</TabsTrigger>
                  <TabsTrigger value="western">Western Client</TabsTrigger>
                </TabsList>
                
                <TabsContent value="arab" className="mt-4">
                  <Card className="p-4 text-left">
                    <h3 className="font-semibold mb-2">Arab Client Profile:</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Formal and respectful tone</li>
                      <li>• Relationship-building before business</li>
                      <li>• Longer decision-making process</li>
                      <li>• Use "Assalamu alaikum" greeting</li>
                      <li>• Face-to-face meetings preferred</li>
                    </ul>
                  </Card>
                </TabsContent>
                
                <TabsContent value="indian" className="mt-4">
                  <Card className="p-4 text-left">
                    <h3 className="font-semibold mb-2">Indian Client Profile:</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Detailed ROI calculations important</li>
                      <li>• Expect and prepare for negotiation</li>
                      <li>• Multiple decision-makers common</li>
                      <li>• Value thoroughness over speed</li>
                      <li>• Technical specifications appreciated</li>
                    </ul>
                  </Card>
                </TabsContent>
                
                <TabsContent value="western" className="mt-4">
                  <Card className="p-4 text-left">
                    <h3 className="font-semibold mb-2">Western Client Profile:</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Direct and efficient approach</li>
                      <li>• Time is money - no excessive small talk</li>
                      <li>• Quick decision-making preferred</li>
                      <li>• Clear yes/no decisions</li>
                      <li>• Professional and structured</li>
                    </ul>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => setShowDemo(true)}
            >
              Launch Interactive Demo
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <div className="bg-primary text-primary-foreground p-2 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowDemo(false)}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Setup
        </Button>
        <h1 className="text-lg font-semibold">
          Comprehensive Script Demo - {selectedCulture.toUpperCase()} Client
        </h1>
        <Badge variant="secondary">
          LIVE TEST MODE
        </Badge>
      </div>
      
      <ComprehensiveScriptDemo 
        prospectName="Ahmed Al Maktoum"
        prospectCompany="Dubai Trading Solutions"
        culture={selectedCulture}
      />
    </div>
  );
}
