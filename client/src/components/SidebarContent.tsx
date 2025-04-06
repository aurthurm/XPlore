import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Info, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

type SidebarItemProps = {
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
  type: "ad" | "news" | "event";
};

const SidebarItem = ({ title, description, imageUrl, ctaText, ctaUrl, type }: SidebarItemProps) => {
  const getBadgeVariant = () => {
    switch (type) {
      case "ad": return "secondary";
      case "news": return "default";
      case "event": return "destructive";
      default: return "outline";
    }
  };

  const getBadgeText = () => {
    switch (type) {
      case "ad": return "Sponsored";
      case "news": return "News";
      case "event": return "Event";
      default: return "";
    }
  };

  const getBadgeIcon = () => {
    switch (type) {
      case "ad": return <Info className="h-3 w-3 mr-1" />;
      case "news": return null;
      case "event": return <Calendar className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <Card className="mb-6 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={title} 
          className="h-40 w-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge variant={getBadgeVariant()} className="flex items-center text-xs">
            {getBadgeIcon()}
            {getBadgeText()}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-slate-600">{description}</p>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between items-center">
        <Button variant="link" className="p-0 h-auto text-primary" asChild>
          <Link href={ctaUrl}>
            <span>{ctaText}</span>
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

const SidebarContent = () => {
  // Sidebar event data
  const events = [
    {
      title: "Victoria Falls Carnival",
      description: "Experience the excitement of a 3-day music festival with top artists near the majestic Victoria Falls.",
      imageUrl: "https://source.unsplash.com/random/600x400/?festival",
      ctaText: "Get tickets",
      ctaUrl: "/events/victoria-falls-carnival",
      type: "event" as const
    },
    {
      title: "Zimbabwe Tourism Expo",
      description: "Connect with local businesses and discover unique experiences at Zimbabwe's biggest tourism event.",
      imageUrl: "https://source.unsplash.com/random/600x400/?tourism",
      ctaText: "Learn more",
      ctaUrl: "/events/tourism-expo",
      type: "event" as const
    }
  ];

  // News items data
  const newsItems = [
    {
      title: "New National Park Opens",
      description: "Zimbabwe welcomes a new protected wildlife area, expanding conservation efforts in the eastern highlands.",
      imageUrl: "https://source.unsplash.com/random/600x400/?wildlife",
      ctaText: "Read more",
      ctaUrl: "/news/new-national-park",
      type: "news" as const
    }
  ];

  // Sponsored content
  const sponsored = [
    {
      title: "Eco-Tourism Adventures",
      description: "Book your sustainable safari experience with our premium eco-friendly tours. Special discount for this month!",
      imageUrl: "https://source.unsplash.com/random/600x400/?safari",
      ctaText: "Explore packages",
      ctaUrl: "/promotions/eco-tourism",
      type: "ad" as const
    }
  ];

  return (
    <div className="sidebar-content">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Upcoming Events</h3>
        {events.map((event, index) => (
          <SidebarItem key={`event-${index}`} {...event} />
        ))}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Latest News</h3>
        {newsItems.map((news, index) => (
          <SidebarItem key={`news-${index}`} {...news} />
        ))}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Featured</h3>
        {sponsored.map((ad, index) => (
          <SidebarItem key={`ad-${index}`} {...ad} />
        ))}
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <h3 className="font-medium text-primary mb-2">Need Travel Assistance?</h3>
          <p className="text-sm text-slate-700 mb-4">
            Connect with local travel experts who can help plan your perfect Zimbabwe adventure.
          </p>
          <Button className="w-full">Contact a Travel Expert</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SidebarContent;