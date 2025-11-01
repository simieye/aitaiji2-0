// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Mail, Linkedin, Twitter, Github } from 'lucide-react';

export function TeamMemberCard({
  member
}) {
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
      <CardHeader className="text-center">
        <img src={member.avatar} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-red-500" />
        <CardTitle className="text-white">{member.name}</CardTitle>
        <CardDescription className="text-red-400">{member.role}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 text-center mb-4">{member.bio}</p>
        <div className="flex justify-center space-x-4">
          {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>}
          {member.twitter && <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>}
          {member.github && <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">
              <Github className="w-5 h-5" />
            </a>}
          {member.email && <a href={`mailto:${member.email}`} className="text-gray-400 hover:text-red-500 transition-colors">
              <Mail className="w-5 h-5" />
            </a>}
        </div>
      </CardContent>
    </Card>;
}