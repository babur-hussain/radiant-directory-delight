
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FAQSection from '@/components/faq/FAQSection';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

const CollaborationGuidelines: React.FC = () => {
  const brandFAQs = [
    {
      question: "How do you select influencers for my brand?",
      answer: "We use a comprehensive vetting process that evaluates influencers based on audience demographics, engagement metrics, content quality, and brand alignment. We work closely with you to understand your brand values and campaign objectives before proposing influencer partnerships."
    },
    {
      question: "What information do I need to provide for a campaign brief?",
      answer: "A good campaign brief includes your campaign objectives, key messaging points, content guidelines, timeline, budget, and any specific deliverables or calls to action. We provide a template and guide you through creating an effective brief."
    },
    {
      question: "How much creative freedom should influencers have?",
      answer: "We recommend providing clear guidelines while allowing influencers creative freedom. Their authentic voice is what resonates with their audience. Finding the right balance between brand messaging and creator authenticity typically yields the best results."
    },
    {
      question: "How long does an influencer campaign typically take from start to finish?",
      answer: "The timeline varies based on campaign complexity, but generally: 1-2 weeks for planning and influencer selection, 1 week for contract negotiation, 1-2 weeks for content creation and approval, and 1-4 weeks for content distribution and reporting."
    },
    {
      question: "How do you measure campaign success?",
      answer: "We establish campaign-specific KPIs aligned with your objectives, which might include reach, engagement, website traffic, conversions, or sales. Our reporting provides comprehensive insights on these metrics, including audience demographics and sentiment analysis."
    },
    {
      question: "What budget do I need for an effective influencer campaign?",
      answer: "Campaign budgets vary widely based on objectives, influencer tiers, and content requirements. We work with budgets starting from ₹1 lakh and create strategies that maximize your ROI regardless of budget size."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Brand Collaboration <span className="text-brand-orange">Guidelines</span></h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our comprehensive guidelines to help brands develop effective influencer marketing campaigns that drive authentic engagement and measurable results.
          </p>
        </div>
        
        <Tabs defaultValue="expectations" className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="expectations">Expectations</TabsTrigger>
              <TabsTrigger value="process">Campaign Process</TabsTrigger>
              <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="expectations">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Clear Objectives</h4>
                    <p className="text-gray-600 text-sm">Define specific, measurable goals for your influencer campaign before starting.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Comprehensive Briefing</h4>
                    <p className="text-gray-600 text-sm">Provide influencers with clear guidelines while allowing creative freedom.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Long-term Relationships</h4>
                    <p className="text-gray-600 text-sm">Consider developing ongoing partnerships rather than one-off collaborations for better authenticity.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Fair Compensation</h4>
                    <p className="text-gray-600 text-sm">Value influencers' work appropriately based on their reach, engagement, and content quality.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Transparent Communication</h4>
                    <p className="text-gray-600 text-sm">Maintain open dialogue throughout the campaign process to address any concerns.</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                    Common Pitfalls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Prioritizing Followers Over Engagement</h4>
                    <p className="text-gray-600 text-sm">Don't select influencers based solely on follower count; engagement rate and audience quality are more important.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Excessive Control</h4>
                    <p className="text-gray-600 text-sm">Overly scripted content often feels inauthentic and performs poorly with audiences.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Unclear Expectations</h4>
                    <p className="text-gray-600 text-sm">Failing to clearly define deliverables, timelines, and usage rights can lead to disputes.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Neglecting FTC Guidelines</h4>
                    <p className="text-gray-600 text-sm">Ensure all sponsored content is clearly disclosed according to advertising standards.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Ignoring Analytics</h4>
                    <p className="text-gray-600 text-sm">Not tracking performance metrics means missing opportunities to optimize future campaigns.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="process">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-blue-500" />
                  Campaign Process Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="relative pl-8 border-l-2 border-gray-200 pb-8">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-brand-orange"></div>
                    <h4 className="font-semibold text-lg mb-2">1. Discovery & Strategy</h4>
                    <p className="text-gray-600 mb-2">We work with you to understand your brand, objectives, target audience, and campaign goals.</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium">Deliverables:</p>
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        <li>Campaign strategy document</li>
                        <li>Budget allocation plan</li>
                        <li>Timeline with key milestones</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="relative pl-8 border-l-2 border-gray-200 pb-8">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-brand-orange"></div>
                    <h4 className="font-semibold text-lg mb-2">2. Influencer Selection</h4>
                    <p className="text-gray-600 mb-2">We identify and vet influencers who align with your brand values and have the right audience for your campaign.</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium">Deliverables:</p>
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        <li>Curated list of recommended influencers</li>
                        <li>Detailed profiles with audience demographics</li>
                        <li>Performance metrics and engagement analysis</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="relative pl-8 border-l-2 border-gray-200 pb-8">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-brand-orange"></div>
                    <h4 className="font-semibold text-lg mb-2">3. Outreach & Negotiation</h4>
                    <p className="text-gray-600 mb-2">We handle influencer outreach, contract negotiation, and agreement on deliverables and compensation.</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium">Deliverables:</p>
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        <li>Finalized influencer contracts</li>
                        <li>Content brief for influencers</li>
                        <li>Payment schedule</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="relative pl-8 border-l-2 border-gray-200 pb-8">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-brand-orange"></div>
                    <h4 className="font-semibold text-lg mb-2">4. Content Creation & Approval</h4>
                    <p className="text-gray-600 mb-2">Influencers develop content based on the brief, which is then reviewed and approved before publishing.</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium">Deliverables:</p>
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        <li>Draft content for review</li>
                        <li>Feedback and revision process</li>
                        <li>Final content approval</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="relative pl-8 border-l-2 border-gray-200">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-brand-orange"></div>
                    <h4 className="font-semibold text-lg mb-2">5. Campaign Launch & Monitoring</h4>
                    <p className="text-gray-600 mb-2">Content is published according to the campaign schedule, with real-time monitoring of performance.</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium">Deliverables:</p>
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        <li>Content publication schedule</li>
                        <li>Real-time performance dashboard</li>
                        <li>Optimization recommendations</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="relative pl-8">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-brand-orange"></div>
                    <h4 className="font-semibold text-lg mb-2">6. Reporting & Analysis</h4>
                    <p className="text-gray-600 mb-2">Comprehensive analysis of campaign performance against KPIs, with insights for future campaigns.</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium">Deliverables:</p>
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        <li>Detailed campaign performance report</li>
                        <li>ROI analysis</li>
                        <li>Strategic recommendations for future campaigns</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="deliverables">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Standard Content Deliverables</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Instagram Posts</h4>
                    <p className="text-gray-600 text-sm">High-quality feed posts with captivating imagery featuring your product or service with engaging caption and appropriate disclosure.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Instagram Stories</h4>
                    <p className="text-gray-600 text-sm">Series of 3-5 connected stories that showcase your product features, benefits, or behind-the-scenes content with swipe-up link (if applicable).</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">YouTube Videos</h4>
                    <p className="text-gray-600 text-sm">Dedicated videos or integrated mentions within existing content formats, with clear calls to action and product demonstration.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Blog Posts</h4>
                    <p className="text-gray-600 text-sm">In-depth written content with SEO optimization, quality images, and integrated brand mentions with backlinks.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">TikTok/Reels</h4>
                    <p className="text-gray-600 text-sm">Short-form video content that creatively showcases your product while aligning with platform trends and audience expectations.</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Content Rights & Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Standard Usage Rights</h4>
                    <p className="text-gray-600 text-sm">Rights to repost influencer content on your own social channels with proper attribution for a period of 3 months.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Extended Rights</h4>
                    <p className="text-gray-600 text-sm">Additional negotiated rights for website usage, email marketing, or other digital channels, typically for 6-12 months.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Advertising Usage</h4>
                    <p className="text-gray-600 text-sm">Rights to use content in paid advertising requires separate negotiation and typically incurs additional fees.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Exclusivity Clauses</h4>
                    <p className="text-gray-600 text-sm">Agreements on whether influencers can work with competing brands during or after your campaign period.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Content Ownership</h4>
                    <p className="text-gray-600 text-sm">Clear terms regarding intellectual property rights and content ownership between brand and influencer.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <FAQSection 
          title="Frequently Asked <span class='text-brand-orange'>Questions</span>"
          subtitle="Common questions about our brand collaboration process and guidelines"
          faqs={brandFAQs}
          className="mt-16 pt-0"
        />
      </div>
    </section>
  );
};

export default CollaborationGuidelines;
