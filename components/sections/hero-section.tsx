import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Users, CheckCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section id="home" className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-gradient-to-b from-primary/5 to-background">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Tepro September 2025 Registration
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">Prodiakon Gereja Santa Anna - Paroki Duren Sawit.</p>
            <p className="mt-6 text-lg text-muted-foreground">Live Another Day - Climb A Little Higher.</p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="#register">
                <Button size="lg" className="w-full sm:w-auto">
                  Registration
                </Button>
              </Link>
              <Link href="#about">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-sm">Easy Scheduling</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm">Group Management</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm">Instant Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
