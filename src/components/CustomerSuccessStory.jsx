// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
// @ts-ignore;
import { Quote, Star, TrendingUp, Award } from 'lucide-react';

export function CustomerSuccessStory({
  story
}) {
  const [expanded, setExpanded] = useState(false);
  const renderStars = rating => {
    return Array.from({
      length: 5
    }, (_, i) => <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-600'}`} />);
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <img src={story.customerLogo || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop&crop=face'} alt={story.customerName} className="w-12 h-12 rounded-lg" />
            <div>
              <CardTitle className="text-white">{story.customerName}</CardTitle>
              <div className="text-gray-400 text-sm">{story.industry}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex">{renderStars(story.rating || 5)}</div>
            <div className="text-gray-400 text-xs mt-1">{story.implementationDate}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Quote className="w-8 h-8 text-red-500/20 absolute -top-2 -left-2" />
            <p className="text-gray-300 italic pl-6">
              {expanded ? story.fullTestimonial : story.testimonial}
            </p>
            {story.fullTestimonial && story.fullTestimonial !== story.testimonial && <Button onClick={() => setExpanded(!expanded)} variant="ghost" size="sm" className="text-red-500 hover:text-red-400 mt-2">
                {expanded ? '收起' : '展开更多'}
              </Button>}
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
            <div className="text-center">
              <div className="flex items-center justify-center text-green-500 mb-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="font-bold">{story.efficiencyGain || 45}%</span>
              </div>
              <div className="text-gray-400 text-xs">效率提升</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-blue-500 mb-1">
                <Award className="w-4 h-4 mr-1" />
                <span className="font-bold">{story.roi || 200}%</span>
              </div>
              <div className="text-gray-400 text-xs">投资回报</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-purple-500 mb-1">
                <Star className="w-4 h-4 mr-1" />
                <span className="font-bold">{story.satisfaction || 98}%</span>
              </div>
              <div className="text-gray-400 text-xs">满意度</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {story.tags?.map((tag, index) => <span key={index} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
                {tag}
              </span>)}
          </div>
        </div>
      </CardContent>
    </Card>;
}