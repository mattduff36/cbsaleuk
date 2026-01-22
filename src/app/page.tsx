"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ListingCard from "@/components/listing-card";
import Layout from "@/components/layout";
import { CarBootSale } from "@/types";
import { LiveSearch } from "@/components/live-search";
import { CompactWeekendWeather } from "@/components/weekend-weather";

export default function Home() {
  const [searchLocation, setSearchLocation] = useState('');
  
  // Fetch featured car boot sales
  const { data: featuredSales, isLoading } = useQuery<CarBootSale[]>({
    queryKey: ['/api/car-boot-sales'],
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative text-white">
        <div 
          className="relative text-white h-[800px] flex items-center justify-center uk-map-background"
        >
          <div className="container mx-auto px-4 relative z-10" style={{ paddingTop: searchLocation && searchLocation.length > 2 ? '180px' : '80px', paddingBottom: '192px' }}>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                Find a Car Boot Sale
              </h1>
              <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
                Browse hundreds of car boot sales across the United Kingdom.
              </p>
              
              {/* Search Box */}
              <div className="bg-white rounded-xl shadow-xl p-6 text-left relative z-50">
                <LiveSearch onLocationChange={setSearchLocation} />
                
                {/* Weekend Weather - positioned under search */}
                {searchLocation && searchLocation.length > 2 && (
                  <div className="mt-4">
                    <CompactWeekendWeather location={searchLocation} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900" id="featured-sales">
              Featured Car Boot Sales
            </h2>
            <Link href="/search" className="text-primary hover:text-primary/90 font-medium flex items-center gap-1 group">
              <span>View all</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-full" />
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : featuredSales && featuredSales.length > 0 ? (
              // Render 6 featured sales
              featuredSales.slice(0, 6).map((sale) => (
                <ListingCard key={sale.id} sale={sale} />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <h3 className="text-lg text-gray-500">No car boot sales found</h3>
                <p className="mt-2 mb-4">Be the first to list your car boot sale!</p>
                <Link href="/list-sale">
                  <Button className="bg-primary hover:bg-primary/90">
                    List Your Sale
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* List Your Sale Section */}
      <section className="py-24 md:py-32 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Image Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden aspect-square">
              <div 
                className="h-full w-full bg-cover bg-center" 
                style={{ 
                  backgroundImage: "url('/assets/carboot2_1757961041589.png')"
                }}
              ></div>
            </div>
            
            {/* Content Card */}
            <div className="bg-white rounded-2xl shadow-xl p-10 md:p-12 flex flex-col justify-center">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-6">Promote Your Car Boot Sale</h2>
              <p className="text-gray-600 mb-8 text-lg">One simple annual fee gets you everything you need. That&apos;s less than a pub lunch! Incredible value for a full year with no booking fees or commissions.</p>
              
              <div className="space-y-5 mb-8">
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-4 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-800">One simple annual fee: £25</span>
                </div>
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-4 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-800">List unlimited events for 12 months</span>
                </div>
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-4 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-800">No booking fees, no commission</span>
                </div>
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-4 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-800">Reach thousands of local visitors</span>
                </div>
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-4 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-800">Get automatic email reminders for your events</span>
                </div>
              </div>
                
              <Link href="/list-sale">
                <Button className="w-full py-6 bg-red-500 hover:bg-red-600 text-white text-lg rounded-xl font-medium">
                  Start for £25 a Year
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-6" id="how-it-works">How CarBootSale.com Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Find car boot sales or create your own listing in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="group bg-white p-8 rounded-2xl hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-xl mb-4">Search Your Area</h3>
              <p className="text-gray-600 text-lg">Enter your location or postcode and adjust the search radius to find nearby car boot sales. Check the weather too.</p>
            </div>
            
            {/* Step 2 */}
            <div className="group bg-white p-8 rounded-2xl hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-xl mb-4">Create Your Listing</h3>
              <p className="text-gray-600 text-lg">List your car boot sale with all the key details. Include prices, parking, pets allowed and exact location.</p>
            </div>
            
            {/* Step 3 */}
            <div className="group bg-white p-8 rounded-2xl hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-xl mb-4">Stay Updated</h3>
              <p className="text-gray-600 text-lg">Receive automatic reminders before your event to confirm it&apos;s going ahead. Update your listing with any changes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upgrade Callout */}
      <section className="py-24 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-gray-900">Grow your Car Boot Sale!</h2>
              <p className="text-gray-600 mb-8 text-lg">Premium features to maximize your event&apos;s attendance and create a professional listing that stands out.</p>
              
              <ul className="space-y-5 mb-10">
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-lg text-gray-800">List unlimited car boot sales each week</span>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-lg text-gray-800">Add high-quality photos to each listing</span>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-lg text-gray-800">Weather for the Car Boot Sale the week before</span>
                </li>
              </ul>
              
              <Link href="/register">
                <Button className="text-lg bg-primary hover:bg-primary/90 text-white font-medium px-8 py-6 rounded-xl transition-colors shadow-lg">
                  Create your a Premium Quality listing
                </Button>
              </Link>
            </div>
            
            <div className="order-1 md:order-2 rounded-xl overflow-hidden shadow-2xl relative group flex items-center justify-center bg-white p-3 sm:p-4 w-full max-w-[320px] sm:max-w-[420px] mx-auto aspect-[4/3] sm:aspect-[3/2] md:max-w-none md:aspect-square">
              <img 
                src="/assets/carboot_logo_1757959302151.png" 
                alt="Car boot sale illustration" 
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-in-out"
                loading="lazy" 
                decoding="async" 
                width="640" 
                height="480"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
