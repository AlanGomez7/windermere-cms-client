"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MoreHorizontal, TrendingUp, Home, Users, Calendar, Star, CheckCircle, ArrowUp, Loader2 } from "lucide-react"
import { useGSAPAnimations, useHoverAnimations, useButtonAnimations } from "@/hooks/use-gsap-animations"

// Types for API response
interface DashboardData {
  users: {
    total: number
    admins: number
    visitors: number
  }
  reviews: {
    total: number
    pending: number
    approved: number
    withRating: number
  }
  bookings: {
    total: number
    pending: number
    cancelled: number
    confirmed: number
  }
  enquiries: {
    total: number
  }
  locations: {
    cities: number
  }
  properties: {
    total: number
    active: number
    avgPrice: number
    currency: string
    inactive: number
    avgPetsFee: number
    avgCleaningFee: number
  }
  monthly_revenue: Array<{
    month: string
    currency: string
    totalRevenue: number
    successfulPayments: number
  }>
}

export default function Dashboard() {
  const containerRef = useGSAPAnimations()
  useHoverAnimations()
  useButtonAnimations()

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('https://pnboapcclagdszlabiwp.supabase.co/functions/v1/dashboard-endpoint', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuYm9hcGNjbGFnZHN6bGFiaXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDgwMjIsImV4cCI6MjA3MTEyNDAyMn0.502UKaBbcbgHCOjrX51u6hs6yjETZkOYcPl6ca4x3lM',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: "Functions" })
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`)
        }

        const data = await response.json()
        setDashboardData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
        // Fallback to sample data for development
        setDashboardData({
          users: {
            total: 0,
            admins: 0,
            visitors: 0
          },
          reviews: {
            total: 0,
            pending: 0,
            approved: 0,
            withRating: 0
          },
          bookings: {
            total: 0,
            pending: 0,
            cancelled: 1,
            confirmed: 6
          },
          enquiries: {
            total: 3
          },
          locations: {
            cities: 1
          },
          properties: {
            total: 0,
            active: 3,
            avgPrice: 126.67,
            currency: "GBP",
            inactive: 0,
            avgPetsFee: 25,
            avgCleaningFee: 100
          },
          monthly_revenue: [
            {
              month: "2024-02",
              currency: "GBP",
              totalRevenue: 2275,
              successfulPayments: 2
            },
            {
              month: "2024-03",
              currency: "GBP",
              totalRevenue: 960,
              successfulPayments: 1
            },
            {
              month: "2024-04",
              currency: "GBP",
              totalRevenue: 2100,
              successfulPayments: 2
            },
            {
              month: "2024-05",
              currency: "GBP",
              totalRevenue: 675,
              successfulPayments: 1
            }
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6 bg-gray-50 min-h-full">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
            <span className="text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 lg:p-6 space-y-6 bg-gray-50 min-h-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">Error loading dashboard</div>
            <div className="text-gray-600 text-sm">{error}</div>
            <Button 
              className="mt-4" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // No data state
  if (!dashboardData) {
    return (
      <div className="p-4 lg:p-6 space-y-6 bg-gray-50 min-h-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-600">
            No dashboard data available
          </div>
        </div>
      </div>
    )
  }

  // Calculate total revenue
  const totalRevenue = dashboardData.monthly_revenue.reduce((sum, month) => sum + month.totalRevenue, 0)
  const latestMonth = dashboardData.monthly_revenue[dashboardData.monthly_revenue.length - 1]

  return (
    <div ref={containerRef} className="p-4 lg:p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Stats Cards - Essential Business Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <Card className="animate-card hover-lift bg-green-500 text-white border-0 shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600"></div>
          <CardContent className="p-4 lg:p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="animate-stat">
                <p className="text-green-100 text-sm">Total Revenue</p>
                <p className="text-2xl lg:text-3xl font-bold">£{totalRevenue.toLocaleString()}</p>
                <p className="text-green-200 text-xs">4 months</p>
              </div>
              <div className="relative w-12 h-12 lg:w-16 lg:h-16 animate-float">
                <TrendingUp className="w-8 h-8 lg:w-10 lg:h-10 text-green-200 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-card hover-lift bg-orange-500 text-white border-0 shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600"></div>
          <CardContent className="p-4 lg:p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="animate-stat">
                <p className="text-orange-100 text-sm">Total Bookings</p>
                <p className="text-2xl lg:text-3xl font-bold">{dashboardData.bookings.total}</p>
                <p className="text-orange-200 text-xs">{dashboardData.bookings.confirmed} confirmed</p>
              </div>
              <div className="relative w-12 h-12 lg:w-16 lg:h-16 animate-float">
                <Calendar className="w-8 h-8 lg:w-10 lg:h-10 text-orange-200 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-card hover-lift bg-blue-500 text-white border-0 shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600"></div>
          <CardContent className="p-4 lg:p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="animate-stat">
                <p className="text-blue-100 text-sm">Total Guests</p>
                <p className="text-2xl lg:text-3xl font-bold">{dashboardData.users.total}</p>
                <p className="text-blue-200 text-xs">{dashboardData.users.visitors} visitors</p>
              </div>
              <div className="relative w-12 h-12 lg:w-16 lg:h-16 animate-float">
                <Users className="w-8 h-8 lg:w-10 lg:h-10 text-blue-200 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-card hover-lift bg-purple-500 text-white border-0 shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600"></div>
          <CardContent className="p-4 lg:p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="animate-stat">
                <p className="text-purple-100 text-sm">Enquiries</p>
                <p className="text-2xl lg:text-3xl font-bold">{dashboardData.enquiries.total}</p>
                <p className="text-purple-200 text-xs">need follow-up</p>
              </div>
              <div className="relative w-12 h-12 lg:w-16 lg:h-16 animate-float">
                <CheckCircle className="w-8 h-8 lg:w-10 lg:h-10 text-purple-200 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Bookings Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Monthly Revenue Chart */}
        <Card className="animate-card hover-lift xl:col-span-2 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold">Monthly Revenue</CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                <span className="text-xl lg:text-2xl font-bold animate-stat">
                  £{latestMonth.totalRevenue.toLocaleString()}
                </span>
                <div className="flex items-center text-green-500 text-sm animate-stat">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Last Month (May)
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="animate-button">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-32 lg:h-48 flex items-end justify-between gap-2">
              {dashboardData.monthly_revenue.map((month, i) => {
                const height = (month.totalRevenue / Math.max(...dashboardData.monthly_revenue.map(m => m.totalRevenue))) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs text-gray-500 font-medium">
                      £{(month.totalRevenue / 1000).toFixed(1)}k
                    </div>
                    <div
                      className="animate-chart-bar bg-gradient-to-t from-green-600 to-green-400 rounded-t w-full min-h-[8px] shadow-sm"
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-xs text-gray-500">
                      {month.month.split('-')[1]}/{month.month.split('-')[0].slice(2)}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Property Information */}
        <Card className="animate-card hover-lift shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Lodge Portfolio</CardTitle>
            <p className="text-sm text-gray-500">Property details & pricing</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{dashboardData.properties.active}</h3>
              <p className="text-gray-500 mb-4">Active Lodges</p>
            </div>
            
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg. Price</span>
                <span className="text-sm font-semibold">£{dashboardData.properties.avgPrice}/night</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cleaning Fee</span>
                <span className="text-sm font-semibold">£{dashboardData.properties.avgCleaningFee}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pet Fee</span>
                <span className="text-sm font-semibold">£{dashboardData.properties.avgPetsFee}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Management */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Booking Status Details */}
        <Card className="animate-card hover-lift shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Booking Status</CardTitle>
            <p className="text-sm text-gray-500">Current booking breakdown</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Confirmed Bookings</span>
                <span className="text-sm font-semibold text-green-600">{dashboardData.bookings.confirmed}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="animate-progress h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                  style={{ "--progress-width": `${(dashboardData.bookings.confirmed / dashboardData.bookings.total) * 100}%` } as React.CSSProperties}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Pending Bookings</span>
                <span className="text-sm font-semibold text-yellow-600">{dashboardData.bookings.pending}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="animate-progress h-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full"
                  style={{ "--progress-width": `${(dashboardData.bookings.pending / dashboardData.bookings.total) * 100}%` } as React.CSSProperties}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Cancelled Bookings</span>
                <span className="text-sm font-semibold text-red-600">{dashboardData.bookings.cancelled}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="animate-progress h-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                  style={{ "--progress-width": `${(dashboardData.bookings.cancelled / dashboardData.bookings.total) * 100}%` } as React.CSSProperties}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Overview */}
        <Card className="animate-card hover-lift shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">System Overview</CardTitle>
            <p className="text-sm text-gray-500">Current system status</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Home className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">Active Lodges</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{dashboardData.properties.active}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">Total Users</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{dashboardData.users.total}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium">Total Bookings</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{dashboardData.bookings.total}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium">Enquiries</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{dashboardData.enquiries.total}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium">Reviews</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{dashboardData.reviews.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
