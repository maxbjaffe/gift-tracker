'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Zap,
  Users,
  HelpCircle,
  Copy,
  Check,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SMSGuidePage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const shortcuts = [
    {
      command: 'STATUS',
      aliases: ['check', 'what', 'show', 'list'],
      description: 'View all active restrictions and commitments for all children',
      example: 'STATUS',
    },
    {
      command: 'CLEAR ALL',
      aliases: ['lift all', 'remove all', 'clearall'],
      description: 'Lift all active restrictions for all children',
      example: 'CLEAR ALL',
    },
    {
      command: 'STATS',
      aliases: ['statistics', 'report'],
      description: 'See reliability statistics for this month',
      example: 'STATS',
    },
    {
      command: 'SUMMARY',
      aliases: ['overview'],
      description: 'Quick family overview with counts',
      example: 'SUMMARY',
    },
    {
      command: 'HELP',
      aliases: ['?', 'commands', 'how'],
      description: 'Show all available SMS commands',
      example: 'HELP',
    },
  ];

  const consequenceExamples = [
    {
      title: 'Simple Restriction',
      example: 'No iPad 3 days Emma - homework',
      breakdown: [
        { part: 'No iPad', label: 'What to restrict' },
        { part: '3 days', label: 'Duration' },
        { part: 'Emma', label: 'Child name' },
        { part: 'homework', label: 'Reason' },
      ],
    },
    {
      title: 'Grounding',
      example: 'Ground Jake until Friday - attitude',
      breakdown: [
        { part: 'Ground', label: 'Action' },
        { part: 'Jake', label: 'Child name' },
        { part: 'until Friday', label: 'End date' },
        { part: 'attitude', label: 'Reason' },
      ],
    },
    {
      title: 'Multiple Children',
      example: 'No TV for Emma and Jake 2 days - fighting',
      breakdown: [
        { part: 'No TV', label: 'What to restrict' },
        { part: 'Emma and Jake', label: 'Multiple children' },
        { part: '2 days', label: 'Duration' },
        { part: 'fighting', label: 'Reason' },
      ],
    },
    {
      title: 'All Children',
      example: 'No dessert for all kids 1 day - bedtime',
      breakdown: [
        { part: 'No dessert', label: 'What to restrict' },
        { part: 'all kids', label: 'Applies to everyone' },
        { part: '1 day', label: 'Duration' },
        { part: 'bedtime', label: 'Reason' },
      ],
    },
  ];

  const commitmentExamples = [
    {
      title: 'Homework Commitment',
      example: 'Emma will finish homework by 7pm',
      breakdown: [
        { part: 'Emma', label: 'Child name' },
        { part: 'will finish', label: 'Future action' },
        { part: 'homework', label: 'What to do' },
        { part: 'by 7pm', label: 'Deadline' },
      ],
    },
    {
      title: 'Chore Commitment',
      example: 'Jake clean room tonight',
      breakdown: [
        { part: 'Jake', label: 'Child name' },
        { part: 'clean room', label: 'Task' },
        { part: 'tonight', label: 'When' },
      ],
    },
    {
      title: 'Multiple Children',
      example: 'Emma and Jake will take out trash by 6pm',
      breakdown: [
        { part: 'Emma and Jake', label: 'Multiple children' },
        { part: 'will take out', label: 'Future action' },
        { part: 'trash', label: 'What to do' },
        { part: 'by 6pm', label: 'Deadline' },
      ],
    },
  ];

  const responseCommands = [
    {
      command: 'CONFIRM',
      description: 'Agree with a restriction that needs approval',
      example: 'CONFIRM',
    },
    {
      command: 'DONE',
      description: 'Mark a commitment as completed',
      example: 'DONE',
    },
    {
      command: 'LIFT [item]',
      description: 'End a specific restriction early',
      example: 'LIFT iPad',
    },
  ];

  const tips = [
    {
      icon: '💡',
      title: 'Natural Language',
      description:
        'You can write messages naturally - our AI understands various phrasings and formats.',
    },
    {
      icon: '👥',
      title: 'Multiple Children',
      description:
        'Use "and" to target multiple children, or use "all kids", "everyone", or "both" for everyone.',
    },
    {
      icon: '💬',
      title: 'Context Memory',
      description:
        'The system remembers your conversation for 30 minutes, so you can have multi-turn conversations.',
    },
    {
      icon: '⚡',
      title: 'Quick Actions',
      description:
        'Use shortcuts like STATUS, HELP, or CLEAR ALL for instant results without typing full sentences.',
    },
    {
      icon: '🔔',
      title: 'Notifications',
      description:
        'Both parents will receive notifications when consequences are created or need approval.',
    },
    {
      icon: '📊',
      title: 'Tracking',
      description:
        'All SMS actions are tracked and visible in the web dashboard for full transparency.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/accountability">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-purple-600" />
            SMS Commands Guide
          </h1>
          <p className="text-gray-600 mt-2">
            Learn how to manage your family's accountability system via text message
          </p>
        </div>

        <Tabs defaultValue="shortcuts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="shortcuts">
              <Zap className="h-4 w-4 mr-2" />
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="consequences">
              <MessageSquare className="h-4 w-4 mr-2" />
              Consequences
            </TabsTrigger>
            <TabsTrigger value="commitments">
              <Users className="h-4 w-4 mr-2" />
              Commitments
            </TabsTrigger>
            <TabsTrigger value="tips">
              <HelpCircle className="h-4 w-4 mr-2" />
              Tips
            </TabsTrigger>
          </TabsList>

          {/* Shortcuts Tab */}
          <TabsContent value="shortcuts" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Command Shortcuts</h2>
              <p className="text-gray-600 mb-6">
                Use these single-word commands for instant actions. They work exactly as shown or
                with their aliases.
              </p>

              <div className="space-y-4">
                {shortcuts.map((shortcut, index) => (
                  <Card key={index} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <code className="px-3 py-1 bg-purple-600 text-white rounded font-mono text-sm font-semibold">
                            {shortcut.command}
                          </code>
                          {shortcut.aliases.length > 0 && (
                            <span className="text-xs text-gray-500">
                              or {shortcut.aliases.join(', ')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{shortcut.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(shortcut.example, index)}
                      >
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Response Commands</h3>
              <div className="space-y-3">
                {responseCommands.map((cmd, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <code className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-mono">
                      {cmd.command}
                    </code>
                    <p className="text-sm text-blue-900 flex-1">{cmd.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Consequences Tab */}
          <TabsContent value="consequences" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Creating Consequences via SMS</h2>
              <p className="text-gray-600 mb-6">
                Text a restriction in natural language. Our AI will parse it and create the
                consequence.
              </p>

              <div className="space-y-6">
                {consequenceExamples.map((example, exampleIndex) => (
                  <div key={exampleIndex}>
                    <h3 className="font-semibold text-gray-900 mb-3">{example.title}</h3>
                    <Card className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                      <div className="flex items-center justify-between mb-3">
                        <code className="text-sm font-mono text-red-900 font-semibold">
                          {example.example}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(example.example, exampleIndex + 100)}
                        >
                          {copiedIndex === exampleIndex + 100 ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {example.breakdown.map((item, itemIndex) => (
                          <div key={itemIndex} className="text-xs">
                            <span className="font-medium text-gray-700">{item.label}:</span>
                            <span className="text-gray-600 ml-1">{item.part}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Commitments Tab */}
          <TabsContent value="commitments" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Creating Commitments via SMS</h2>
              <p className="text-gray-600 mb-6">
                Set commitments for your children with deadlines. Use "will" or "gonna" to indicate
                future actions.
              </p>

              <div className="space-y-6">
                {commitmentExamples.map((example, exampleIndex) => (
                  <div key={exampleIndex}>
                    <h3 className="font-semibold text-gray-900 mb-3">{example.title}</h3>
                    <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <code className="text-sm font-mono text-blue-900 font-semibold">
                          {example.example}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(example.example, exampleIndex + 200)}
                        >
                          {copiedIndex === exampleIndex + 200 ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {example.breakdown.map((item, itemIndex) => (
                          <div key={itemIndex} className="text-xs">
                            <span className="font-medium text-gray-700">{item.label}:</span>
                            <span className="text-gray-600 ml-1">{item.part}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="space-y-4">
            <div className="grid gap-4">
              {tips.map((tip, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{tip.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{tip.title}</h3>
                      <p className="text-sm text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300">
              <h3 className="font-semibold text-purple-900 mb-3">Need More Help?</h3>
              <p className="text-sm text-purple-800 mb-4">
                Text <code className="px-2 py-1 bg-purple-600 text-white rounded">HELP</code> to
                your accountability number to get a quick reference guide sent via SMS.
              </p>
              <p className="text-sm text-purple-800">
                You can also visit the{' '}
                <Link href="/accountability/analytics" className="underline font-semibold">
                  Analytics Dashboard
                </Link>{' '}
                to see all your data and patterns.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
