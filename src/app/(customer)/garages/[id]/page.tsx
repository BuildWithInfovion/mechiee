"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Star, MapPin, Phone, Clock, ChevronRight,
  Wrench, Shield, Bike,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RatingStars } from "@/components/shared/RatingStars";
import { formatCurrency } from "@/lib/utils";
import type { Garage, GarageService, Review } from "@/types";

interface GarageDetail extends Garage {
  garage_services: GarageService[];
  reviews: Review[];
}

export default function GarageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [garage, setGarage] = useState<GarageDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/garages/${id}`)
      .then((r) => r.json())
      .then((d) => setGarage(d.garage))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-48 bg-secondary animate-pulse" />
        <div className="px-4 py-4 space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!garage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Garage not found</p>
      </div>
    );
  }

  const handleBook = (serviceId: string, price: number) => {
    router.push(`/bookings/new?garage_id=${garage.id}&service_id=${serviceId}&price=${price}`);
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
        {garage.banner_url && (
          <img src={garage.banner_url} alt="" className="w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 -mt-8 space-y-4">
        {/* Garage info card */}
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {garage.logo_url ? (
                  <img src={garage.logo_url} alt={garage.name} className="w-full h-full object-cover" />
                ) : (
                  <Bike className="w-7 h-7 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-foreground">{garage.name}</h1>
                <div className="flex items-center gap-1 mt-0.5">
                  <RatingStars rating={garage.rating} size="sm" />
                  <span className="text-sm font-medium text-foreground ml-1">{garage.rating?.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({garage.total_reviews} reviews)</span>
                </div>
                <Badge variant={garage.status === "active" ? "success" : "secondary"} className="mt-1.5">
                  <span className="status-dot bg-current" />
                  {garage.status}
                </Badge>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>{garage.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0 text-primary" />
                <span>{garage.phone}</span>
              </div>
              {garage.total_jobs > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 flex-shrink-0 text-primary" />
                  <span>{garage.total_jobs} services completed</span>
                </div>
              )}
            </div>

            {garage.description && (
              <>
                <Separator className="my-3" />
                <p className="text-sm text-muted-foreground">{garage.description}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Services */}
        <div>
          <h2 className="section-title">Services & Pricing</h2>
          {garage.garage_services && garage.garage_services.length > 0 ? (
            <div className="space-y-2">
              {garage.garage_services
                .filter((s) => s.is_available)
                .map((gs) => (
                  <Card key={gs.id} className="card-hover border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                            <Wrench className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {gs.service?.name}
                            </p>
                            {gs.duration_minutes && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{gs.duration_minutes} mins</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-bold text-foreground">{formatCurrency(gs.price)}</span>
                          <Button
                            size="sm"
                            onClick={() => handleBook(gs.service_id, gs.price)}
                            className="text-xs h-8 px-3"
                          >
                            Book
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No services listed yet</p>
          )}
        </div>

        {/* Reviews */}
        {garage.reviews && garage.reviews.length > 0 && (
          <div>
            <h2 className="section-title">Customer Reviews</h2>
            <div className="space-y-3">
              {garage.reviews.slice(0, 5).map((review) => (
                <Card key={review.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">
                        {(review.customer as { user?: { name?: string } })?.user?.name ?? "Customer"}
                      </span>
                      <RatingStars rating={review.rating} size="sm" />
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Book CTA */}
      <div className="fixed bottom-16 left-0 right-0 px-4 py-3 bg-background/90 backdrop-blur-md border-t border-border">
        <div className="max-w-screen-sm mx-auto">
          <Button className="w-full" size="lg" asChild>
            <Link href={`/bookings/new?garage_id=${garage.id}`}>
              Book a Service <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
