// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@/components/ui';
// @ts-ignore;
import { Mail, Linkedin, Twitter } from 'lucide-react';

export function TeamMemberCard({
  member
}) {
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
      <CardHeader className="text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full overflow-hidden">
          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
        </div>
        <CardTitle className="text-white text-lg sm:text-xl">{member.name}</CardTitle>
        <CardDescription className="text-red-500 text-sm sm:text-base font-medium">
          {member.position}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 text-sm sm:text-base mb-4 text-center">
          {member.bio}
        </p>
        <div className="flex justify-center space-x-3">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
            <Mail className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
            <Linkedin className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
            <Twitter className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>;
}