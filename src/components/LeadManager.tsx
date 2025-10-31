import React, { useState, useEffect, useRef } from 'react';
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
  Upload, 
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
  PencilSimple,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from '@phosphor-icons/react';

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone: string;
  company?: string;
  industry: 'real-estate' | 'retail' | 'trading' | 'logistics' | 'consulting';
  status: 'new' | 'contacted' | 'qualified' | 'demo-scheduled' | 'proposal-sent' | 'closed-won' | 'closed-lost';
  source?: string;
  assignedTo?: string;
  notes?: string;
  nextFollowUp?: string;
  estimatedValue?: number;
  contactAttempts: number;
  lastContactDate?: string;
  createdAt: string;
  updatedAt: string;
}

const industryOptions = [
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'retail', label: 'Retail' },
  { value: 'trading', label: 'Trading' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'consulting', label: 'Consulting' }
];

const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-gray-100 text-gray-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-800' },
  { value: 'qualified', label: 'Qualified', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'demo-scheduled', label: 'Demo Scheduled', color: 'bg-purple-100 text-purple-800' },
  { value: 'proposal-sent', label: 'Proposal Sent', color: 'bg-orange-100 text-orange-800' },
  { value: 'closed-won', label: 'Closed Won', color: 'bg-green-100 text-green-800' },
  { value: 'closed-lost', label: 'Closed Lost', color: 'bg-red-100 text-red-800' }
];

export default function LeadManager() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ total: number; processed: number; errors: string[] }>({
    total: 0,
    processed: 0,
    errors: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: 'real-estate',
    source: '',
    notes: '',
    estimatedValue: ''
  });

  // Sample data for demo (replace with actual API calls)
  const sampleLeads: Lead[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1-555-0123',
      company: 'ABC Real Estate',
      industry: 'real-estate',
      status: 'new',
      source: 'website',
      contactAttempts: 0,
      estimatedValue: 5000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@retail.com',
      phone: '+1-555-0124',
      company: 'Retail Plus',
      industry: 'retail',
      status: 'contacted',
      source: 'referral',
      contactAttempts: 2,
      lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedValue: 3000,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  useEffect(() => {
    // Initialize with sample data (replace with API call)
    setLeads(sampleLeads);
    setFilteredLeads(sampleLeads);
  }, []);

  useEffect(() => {
    // Filter leads based on search and filters
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (industryFilter !== 'all') {
      filtered = filtered.filter(lead => lead.industry === industryFilter);
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, industryFilter]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setUploadedFile(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const processCSVUpload = async () => {
    if (!uploadedFile) return;

    setIsLoading(true);
    setUploadProgress({ total: 0, processed: 0, errors: [] });

    try {
      const text = await uploadedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Validate required headers
      const requiredHeaders = ['name', 'phone'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        alert(`Missing required columns: ${missingHeaders.join(', ')}`);
        return;
      }

      const dataLines = lines.slice(1);
      setUploadProgress(prev => ({ ...prev, total: dataLines.length }));

      const newLeads: Lead[] = [];
      const errors: string[] = [];

      for (let i = 0; i < dataLines.length; i++) {
        const values = dataLines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const leadData: any = {};

        headers.forEach((header, index) => {
          leadData[header] = values[index] || '';
        });

        // Validate and create lead
        if (!leadData.name || !leadData.phone) {
          errors.push(`Row ${i + 2}: Missing name or phone`);
          continue;
        }

        const lead: Lead = {
          id: `imported-${Date.now()}-${i}`,
          name: leadData.name,
          email: leadData.email || '',
          phone: leadData.phone,
          company: leadData.company || '',
          industry: (industryOptions.find(opt => opt.value === leadData.industry)?.value || 'consulting') as 'real-estate' | 'retail' | 'trading' | 'logistics' | 'consulting',
          status: 'new',
          source: leadData.source || 'csv-import',
          notes: leadData.notes || '',
          estimatedValue: leadData.estimated_value ? parseFloat(leadData.estimated_value) : undefined,
          contactAttempts: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        newLeads.push(lead);
        setUploadProgress(prev => ({ ...prev, processed: prev.processed + 1 }));
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Add new leads to existing leads
      setLeads(prev => [...prev, ...newLeads]);
      setUploadProgress(prev => ({ ...prev, errors }));
      
      if (errors.length === 0) {
        setShowUploadDialog(false);
        setUploadedFile(null);
        alert(`Successfully imported ${newLeads.length} leads!`);
      }

    } catch (error) {
      console.error('Error processing CSV:', error);
      alert('Error processing CSV file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    
    const lead: Lead = {
      id: `manual-${Date.now()}`,
      name: newLead.name,
      email: newLead.email,
      phone: newLead.phone,
      company: newLead.company,
      industry: newLead.industry as Lead['industry'],
      status: 'new',
      source: newLead.source || 'manual',
      notes: newLead.notes,
      estimatedValue: newLead.estimatedValue ? parseFloat(newLead.estimatedValue) : undefined,
      contactAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setLeads(prev => [lead, ...prev]);
    setShowNewLeadDialog(false);
    setNewLead({
      name: '',
      email: '',
      phone: '',
      company: '',
      industry: 'real-estate',
      source: '',
      notes: '',
      estimatedValue: ''
    });
  };

  const updateLeadStatus = (leadId: string, newStatus: Lead['status']) => {
    setLeads(prev =>
      prev.map(lead =>
        lead.id === leadId
          ? {
              ...lead,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              contactAttempts: newStatus === 'contacted' ? lead.contactAttempts + 1 : lead.contactAttempts,
              lastContactDate: newStatus === 'contacted' ? new Date().toISOString() : lead.lastContactDate
            }
          : lead
      )
    );
  };

  const getStatusBadge = (status: Lead['status']) => {
    const statusConfig = statusOptions.find(opt => opt.value === status);
    return (
      <Badge className={statusConfig?.color || 'bg-gray-100 text-gray-800'}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const downloadSampleCSV = () => {
    const csvContent = `name,email,phone,company,industry,source,notes,estimated_value
John Doe,john@example.com,+1-555-0123,ABC Company,real-estate,website,Great prospect,5000
Jane Smith,jane@retail.com,+1-555-0124,Retail Store,retail,referral,Interested in automation,3000`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads-sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    notContacted: leads.filter(l => l.contactAttempts === 0).length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowUploadDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Leads
          </Button>
          <Button 
            onClick={() => setShowNewLeadDialog(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Not Contacted</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.notContacted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <PhoneCall className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-blue-600">{stats.contacted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Qualified</p>
                <p className="text-2xl font-bold text-green-600">{stats.qualified}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">New</p>
                <p className="text-2xl font-bold">{stats.new}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industryOptions.map(industry => (
                  <SelectItem key={industry.value} value={industry.value}>
                    {industry.label}
                  </SelectItem>
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
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact Attempts</TableHead>
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
                        <div className="text-sm text-gray-600">{lead.email}</div>
                        <div className="text-sm text-gray-600">{lead.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {industryOptions.find(i => i.value === lead.industry)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {lead.contactAttempts === 0 ? (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            Not Contacted
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800">
                            {lead.contactAttempts} attempts
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.lastContactDate ? 
                        new Date(lead.lastContactDate).toLocaleDateString() : 
                        'Never'
                      }
                    </TableCell>
                    <TableCell>
                      {lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select 
                          value={lead.status} 
                          onValueChange={(value) => updateLeadStatus(lead.id, value as Lead['status'])}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* CSV Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Leads from CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select CSV File</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="mt-2"
              />
            </div>
            
            {uploadedFile && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm"><strong>File:</strong> {uploadedFile.name}</p>
                <p className="text-sm"><strong>Size:</strong> {Math.round(uploadedFile.size / 1024)} KB</p>
              </div>
            )}

            {uploadProgress.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{uploadProgress.processed} / {uploadProgress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${
                      uploadProgress.processed === uploadProgress.total ? 'w-full' : 
                      uploadProgress.processed > uploadProgress.total * 0.8 ? 'w-4/5' :
                      uploadProgress.processed > uploadProgress.total * 0.6 ? 'w-3/5' :
                      uploadProgress.processed > uploadProgress.total * 0.4 ? 'w-2/5' :
                      uploadProgress.processed > uploadProgress.total * 0.2 ? 'w-1/5' : 'w-0'
                    }`}
                  ></div>
                </div>
                {uploadProgress.errors.length > 0 && (
                  <div className="bg-red-50 p-2 rounded text-sm text-red-700">
                    <p><strong>Errors:</strong></p>
                    {uploadProgress.errors.slice(0, 3).map((error, i) => (
                      <p key={i}>• {error}</p>
                    ))}
                    {uploadProgress.errors.length > 3 && (
                      <p>... and {uploadProgress.errors.length - 3} more errors</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={downloadSampleCSV}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Sample
              </Button>
              <Button 
                onClick={processCSVUpload}
                disabled={!uploadedFile || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Processing...' : 'Import'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Lead Dialog */}
      <Dialog open={showNewLeadDialog} onOpenChange={setShowNewLeadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateLead} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={newLead.name}
                  onChange={(e) => setNewLead(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={newLead.phone}
                  onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={newLead.company}
                  onChange={(e) => setNewLead(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Industry</Label>
                <Select 
                  value={newLead.industry} 
                  onValueChange={(value) => setNewLead(prev => ({ ...prev, industry: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {industryOptions.map(industry => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estimated Value</Label>
                <Input
                  type="number"
                  value={newLead.estimatedValue}
                  onChange={(e) => setNewLead(prev => ({ ...prev, estimatedValue: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Source</Label>
              <Input
                value={newLead.source}
                onChange={(e) => setNewLead(prev => ({ ...prev, source: e.target.value }))}
                placeholder="e.g., website, referral, cold-call"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={newLead.notes}
                onChange={(e) => setNewLead(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" onClick={() => setShowNewLeadDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Lead
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}