// Lead Management System for Scholarix CRM
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Phone, 
  Envelope, 
  Buildings, 
  User, 
  Calendar, 
  CurrencyDollar,
  MagnifyingGlass,
  Funnel,
  DotsThree,
  PhoneCall,
  ChatCircle,
  PencilSimple
} from '@phosphor-icons/react';

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone: string;
  company?: string;
  industry: 'real-estate' | 'retail' | 'trading' | 'logistics' | 'consulting';
  status: 'new' | 'contacted' | 'qualified' | 'demo-scheduled' | 'proposal-sent' | 'closed-won' | 'closed-lost';
  source?: string;
  assignedTo?: string;
  assignedToName?: string;
  createdBy: string;
  createdByName?: string;
  notes?: string;
  nextFollowUp?: string;
  estimatedValue?: number;
  probability?: number;
  createdAt: string;
  updatedAt: string;
  lastCall?: string;
  callsCount: number;
}

const industryLabels = {
  'real-estate': 'Real Estate',
  'retail': 'Retail',
  'trading': 'Trading',
  'logistics': 'Logistics',
  'consulting': 'Consulting'
};

const statusLabels = {
  'new': 'New',
  'contacted': 'Contacted',
  'qualified': 'Qualified',
  'demo-scheduled': 'Demo Scheduled',
  'proposal-sent': 'Proposal Sent',
  'closed-won': 'Closed Won',
  'closed-lost': 'Closed Lost'
};

const statusColors = {
  'new': 'bg-gray-100 text-gray-800',
  'contacted': 'bg-blue-100 text-blue-800',
  'qualified': 'bg-yellow-100 text-yellow-800',
  'demo-scheduled': 'bg-purple-100 text-purple-800',
  'proposal-sent': 'bg-orange-100 text-orange-800',
  'closed-won': 'bg-green-100 text-green-800',
  'closed-lost': 'bg-red-100 text-red-800'
};

export default function LeadManagement() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: 'real-estate' as Lead['industry'],
    source: '',
    notes: '',
    estimatedValue: '',
    probability: '25'
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('scholarix-auth-token');
      const response = await fetch('/api/leads', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads);
      } else {
        console.error('Failed to fetch leads');
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('scholarix-auth-token');
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newLead,
          estimatedValue: newLead.estimatedValue ? parseFloat(newLead.estimatedValue) : null,
          probability: parseInt(newLead.probability)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(prev => [data.lead, ...prev]);
        setShowNewLeadDialog(false);
        resetNewLeadForm();
      } else {
        console.error('Failed to create lead');
      }
    } catch (error) {
      console.error('Error creating lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetNewLeadForm = () => {
    setNewLead({
      name: '',
      email: '',
      phone: '',
      company: '',
      industry: 'real-estate',
      source: '',
      notes: '',
      estimatedValue: '',
      probability: '25'
    });
  };

  const startCall = (lead: Lead) => {
    // Navigate to call interface with pre-populated lead data
    const prospectInfo = {
      name: lead.name,
      company: lead.company || '',
      industry: lead.industry,
      phone: lead.phone,
      email: lead.email || ''
    };
    
    localStorage.setItem('current-prospect', JSON.stringify(prospectInfo));
    localStorage.setItem('current-lead-id', lead.id);
    window.location.href = '/call';
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesIndustry = industryFilter === 'all' || lead.industry === industryFilter;
    
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const getLeadStats = () => {
    const total = leads.length;
    const new_ = leads.filter(l => l.status === 'new').length;
    const qualified = leads.filter(l => l.status === 'qualified').length;
    const closedWon = leads.filter(l => l.status === 'closed-won').length;
    const totalValue = leads
      .filter(l => l.status === 'closed-won' && l.estimatedValue)
      .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

    return { total, new: new_, qualified, closedWon, totalValue };
  };

  const stats = getLeadStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600 mt-1">Manage your prospects and track conversions</p>
        </div>
        
        <Dialog open={showNewLeadDialog} onOpenChange={setShowNewLeadDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Lead</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newLead.name}
                    onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={newLead.company}
                    onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={newLead.industry} onValueChange={(value) => setNewLead({...newLead, industry: value as Lead['industry']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(industryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    value={newLead.source}
                    onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                    placeholder="Website, referral, cold call..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedValue">Estimated Value (AED)</Label>
                  <Input
                    id="estimatedValue"
                    type="number"
                    value={newLead.estimatedValue}
                    onChange={(e) => setNewLead({...newLead, estimatedValue: e.target.value})}
                    placeholder="25000"
                  />
                </div>
                <div>
                  <Label htmlFor="probability">Probability (%)</Label>
                  <Select value={newLead.probability} onValueChange={(value) => setNewLead({...newLead, probability: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10% - Cold</SelectItem>
                      <SelectItem value="25">25% - Interested</SelectItem>
                      <SelectItem value="50">50% - Qualified</SelectItem>
                      <SelectItem value="75">75% - Hot</SelectItem>
                      <SelectItem value="90">90% - Closing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  placeholder="Initial notes about this lead..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowNewLeadDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Lead'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-gray-600" />
              <div className="ml-3">
                <p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-sm font-medium">{stats.new}</span>
              </div>
              <div className="ml-3">
                <p className="text-2xl font-semibold">{stats.new}</p>
                <p className="text-sm text-gray-600">New Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
                <span className="text-sm font-medium text-yellow-800">{stats.qualified}</span>
              </div>
              <div className="ml-3">
                <p className="text-2xl font-semibold">{stats.qualified}</p>
                <p className="text-sm text-gray-600">Qualified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                <span className="text-sm font-medium text-green-800">{stats.closedWon}</span>
              </div>
              <div className="ml-3">
                <p className="text-2xl font-semibold">{stats.closedWon}</p>
                <p className="text-sm text-gray-600">Closed Won</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CurrencyDollar className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-2xl font-semibold">{stats.totalValue.toLocaleString()}</p>
                <p className="text-sm text-gray-600">AED Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search leads by name, company, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {Object.entries(industryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{lead.name}</div>
                        <div className="text-sm text-gray-600">
                          {lead.phone} {lead.email && `• ${lead.email}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {lead.company && (
                          <>
                            <Buildings className="h-4 w-4 text-gray-400 mr-1" />
                            {lead.company}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {industryLabels[lead.industry]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[lead.status]}>
                        {statusLabels[lead.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.assignedToName || 'Unassigned'}</TableCell>
                    <TableCell>
                      {lead.lastCall ? (
                        <div className="text-sm">
                          {new Date(lead.lastCall).toLocaleDateString()}
                          <div className="text-xs text-gray-500">
                            {lead.callsCount} call{lead.callsCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No calls</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.estimatedValue ? (
                        <div>
                          <div className="font-medium">
                            {lead.estimatedValue.toLocaleString()} AED
                          </div>
                          <div className="text-xs text-gray-500">
                            {lead.probability}% probability
                          </div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startCall(lead)}
                          title="Start Call"
                        >
                          <PhoneCall className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          title="Send Message"
                        >
                          <ChatCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          title="Edit Lead"
                        >
                          <PencilSimple className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredLeads.length === 0 && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No leads found matching your criteria.</p>
              <Button className="mt-4" onClick={() => setShowNewLeadDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Lead
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}