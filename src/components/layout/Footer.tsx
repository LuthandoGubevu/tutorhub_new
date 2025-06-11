// src/components/layout/Footer.tsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-foreground py-8 text-center mt-auto">
      <div className="container mx-auto px-4">
        <p className="text-sm font-headline">TutorHub Online Academy</p>
        <p className="text-xs text-muted-foreground mb-2">Empowering Students, One Lesson at a Time.</p>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} TutorHub Online Academy. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
