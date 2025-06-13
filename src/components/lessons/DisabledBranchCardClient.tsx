
// src/components/lessons/DisabledBranchCardClient.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, ArrowRight } from 'lucide-react';
import type { SubjectName, LessonBranch } from '@/types';

interface DisabledBranchCardClientProps {
  branch: LessonBranch;
  subjectName: SubjectName;
}

const DisabledBranchCardClient: React.FC<DisabledBranchCardClientProps> = ({ branch, subjectName }) => {
  const handleClick = () => {
    alert("Not Available Yet. This feature is coming soon!");
  };

  const cardInnerContent = (
    <>
      <CardHeader className="items-center p-2">
        <FolderOpen className="h-10 w-10 mb-2 text-gray-400" />
        <CardTitle className="font-headline text-xl text-gray-500">
          {branch.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow mt-2">
        <p className="text-sm text-gray-400">Explore lessons in {branch.name}.</p>
      </CardContent>
      <div className="mt-auto font-semibold flex items-center text-sm text-red-600">
        Not Available Yet
      </div>
    </>
  );

  return (
    <div
      className="block"
      onClick={handleClick}
      aria-disabled="true"
      role="button" // Add role for better accessibility for div with onClick
      tabIndex={0} // Make it focusable
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }} // Keyboard interaction
    >
      <Card className="shadow-md transition-all duration-300 rounded-lg h-full flex flex-col items-center text-center p-6 bg-gray-100 border-gray-300 opacity-70 cursor-not-allowed border-2">
        {cardInnerContent}
      </Card>
    </div>
  );
};

export default DisabledBranchCardClient;
