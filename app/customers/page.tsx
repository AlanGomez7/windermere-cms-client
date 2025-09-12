"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search, Phone, Video, MessageSquare, MoreHorizontal, Loader2, Plus, User } from "lucide-react"
import { useVisitors, useCreateVisitor } from "@/hooks/use-api"
import { Visitor } from "@/lib/api"
import { toast } from "sonner"

export default function CustomersPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [verificationFilter, setVerificationFilter] = useState("")
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newVisitor, setNewVisitor] = useState({
    name: "",
    email: "",
    mobile: ""
  })

  // API hooks
  const [visitorsState, visitorsActions] = useVisitors()
  const [createVisitorState, createVisitorActions] = useCreateVisitor()

  // Load visitors on component mount
  useEffect(() => {
    loadVisitors()
  }, [])

  // Update local state when API data changes
  useEffect(() => {
    console.log("uuu")
    if (visitorsState.data) {
      console.log(visitorsState)
      setVisitors(visitorsState.data)
    }
  }, [visitorsState.data])

  const loadVisitors = async () => {
    try {
      await visitorsActions.execute()
    } catch (error) {
      toast.error("Failed to load customers")
    }
  }

  const handleAddCustomer = async () => {
    if (!newVisitor.name.trim()) {
      toast.error("Name is required")
      return
    }

    try {
      await createVisitorActions.execute(newVisitor)
      toast.success("Customer added successfully!")
      setAddModalOpen(false)
      setNewVisitor({ name: "", email: "", mobile: "" })
      loadVisitors()
    } catch (error) {
      toast.error("Failed to add customer")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getLocation = (visitor: Visitor) => {
    // For now, we'll use a placeholder location
    // In a real app, you might store location in the visitor data
    return "TY35 Avenue GG London Center"
  }

  const getVerificationBadge = (visitor: Visitor) => {
    if (visitor.verified) {
      return <Badge className="bg-green-500 text-white text-xs">Verified</Badge>
    } else {
      return <Badge className="bg-yellow-500 text-white text-xs">Unverified</Badge>
    }
  }

  const filteredVisitors = visitors.filter(visitor => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      visitor.name?.toLowerCase().includes(searchLower) ||
      visitor.email?.toLowerCase().includes(searchLower) ||
      visitor.mobile?.toLowerCase().includes(searchLower)
    
    // Apply verification filter
    const matchesVerification = 
      !verificationFilter || 
      (verificationFilter === 'verified' && visitor.verified) ||
      (verificationFilter === 'unverified' && !visitor.verified)
    
    return matchesSearch && matchesVerification
  })

  if (visitorsState.loading && visitors.length === 0) {
    return (
      <div className="p-6 space-y-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading customers...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search customers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-80 bg-white border-gray-200" 
          />
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search customers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-96 bg-white border-gray-200" 
          />
        </div>
        <div className="flex gap-3">
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">All Verification Status</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
          <Button 
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Customer
          </Button>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredVisitors.map((visitor) => (
          <Card key={visitor.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" />
                    <AvatarFallback className="bg-gray-200 text-gray-700">
                      {visitor.name ? getInitials(visitor.name) : <User className="w-6 h-6" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full absolute -top-1 -right-1 border-2 border-white ${
                      visitor.verified ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                  </div>
                </div>
                {/* <div className="flex items-center gap-2">
                  {getVerificationBadge(visitor)}
                  </div> */}
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
              </div>

              <div className="space-y-2 mb-4">
                <h3 className="font-semibold text-gray-900">{visitor.name || 'Unnamed Customer'}</h3>
                <p className="text-sm text-gray-500">#{visitor.id.slice(0, 8)}</p>
              </div>

              <div className="flex gap-2 mb-4">
                <Button 
                  size="icon" 
                  className="w-8 h-8 bg-teal-600 hover:bg-teal-700 rounded-full"
                  title="Call"
                  disabled={!visitor.mobile}
                >
                  <Phone className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" 
                  className="w-8 h-8 bg-blue-600 hover:bg-blue-700"
                  title="Video Call"
                  disabled={!visitor.mobile}
                >
                  <Video className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" 
                  className="w-8 h-8 bg-green-600 hover:bg-green-700"
                  title="Message"
                  disabled={!visitor.email && !visitor.mobile}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Contact Info</p>
                {visitor.email && (
                  <p className="text-sm font-medium text-gray-900 mb-1">{visitor.email}</p>
                )}
                {visitor.mobile && (
                  <p className="text-sm font-medium text-gray-900">{visitor.mobile}</p>
                )}
                {!visitor.email && !visitor.mobile && (
                  <p className="text-sm text-gray-400">No contact info</p>
                )}
                <div className="mt-2">
                  {getVerificationBadge(visitor)}
                </div>
              </div>

              {/* <div className="mt-3">
                <p className="text-sm text-gray-500 mb-1">Location</p>
                <p className="text-sm font-medium text-gray-900">{getLocation(visitor)}</p>
              </div> */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredVisitors.length === 0 && !visitorsState.loading && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No customers found.</p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredVisitors.length} from {visitors.length} customers
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <Button variant="outline" size="sm">
            4
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Customer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newVisitor.name}
                onChange={(e) => setNewVisitor(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newVisitor.email}
                onChange={(e) => setNewVisitor(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={newVisitor.mobile}
                onChange={(e) => setNewVisitor(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder="Enter mobile number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCustomer}
              disabled={createVisitorState.loading || !newVisitor.name.trim()}
            >
              {createVisitorState.loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
