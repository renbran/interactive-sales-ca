import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Plus, User, PhoneCall, Download, CheckCircle, Clock } from '@phosphor-icons/react';
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
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [industryFilter, setIndustryFilter] = useState('all');
    const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState({
        total: 0,
        processed: 0,
        errors: []
    });
    const fileInputRef = useRef(null);
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
    const sampleLeads = [
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
            filtered = filtered.filter(lead => lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.email?.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(lead => lead.status === statusFilter);
        }
        if (industryFilter !== 'all') {
            filtered = filtered.filter(lead => lead.industry === industryFilter);
        }
        setFilteredLeads(filtered);
    }, [leads, searchTerm, statusFilter, industryFilter]);
    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
            setUploadedFile(file);
        }
        else {
            alert('Please select a valid CSV file');
        }
    };
    const processCSVUpload = async () => {
        if (!uploadedFile)
            return;
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
            const newLeads = [];
            const errors = [];
            for (let i = 0; i < dataLines.length; i++) {
                const values = dataLines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                const leadData = {};
                headers.forEach((header, index) => {
                    leadData[header] = values[index] || '';
                });
                // Validate and create lead
                if (!leadData.name || !leadData.phone) {
                    errors.push(`Row ${i + 2}: Missing name or phone`);
                    continue;
                }
                const lead = {
                    id: `imported-${Date.now()}-${i}`,
                    name: leadData.name,
                    email: leadData.email || '',
                    phone: leadData.phone,
                    company: leadData.company || '',
                    industry: (industryOptions.find(opt => opt.value === leadData.industry)?.value || 'consulting'),
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
        }
        catch (error) {
            console.error('Error processing CSV:', error);
            alert('Error processing CSV file');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreateLead = (e) => {
        e.preventDefault();
        const lead = {
            id: `manual-${Date.now()}`,
            name: newLead.name,
            email: newLead.email,
            phone: newLead.phone,
            company: newLead.company,
            industry: newLead.industry,
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
    const updateLeadStatus = (leadId, newStatus) => {
        setLeads(prev => prev.map(lead => lead.id === leadId
            ? {
                ...lead,
                status: newStatus,
                updatedAt: new Date().toISOString(),
                contactAttempts: newStatus === 'contacted' ? lead.contactAttempts + 1 : lead.contactAttempts,
                lastContactDate: newStatus === 'contacted' ? new Date().toISOString() : lead.lastContactDate
            }
            : lead));
    };
    const getStatusBadge = (status) => {
        const statusConfig = statusOptions.find(opt => opt.value === status);
        return (_jsx(Badge, { className: statusConfig?.color || 'bg-gray-100 text-gray-800', children: statusConfig?.label || status }));
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
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Lead Management" }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(Button, { onClick: () => setShowUploadDialog(true), className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), "Import Leads"] }), _jsxs(Button, { onClick: () => setShowNewLeadDialog(true), className: "bg-green-600 hover:bg-green-700", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Lead"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(User, { className: "h-5 w-5 text-gray-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total Leads" }), _jsx("p", { className: "text-2xl font-bold", children: stats.total })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "h-5 w-5 text-yellow-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Not Contacted" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600", children: stats.notContacted })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(PhoneCall, { className: "h-5 w-5 text-blue-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Contacted" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: stats.contacted })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Qualified" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: stats.qualified })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(User, { className: "h-5 w-5 text-gray-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "New" }), _jsx("p", { className: "text-2xl font-bold", children: stats.new })] })] }) }) })] }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsx("div", { className: "flex-1 min-w-[200px]", children: _jsx(Input, { placeholder: "Search leads...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full" }) }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "Filter by status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Statuses" }), statusOptions.map(status => (_jsx(SelectItem, { value: status.value, children: status.label }, status.value)))] })] }), _jsxs(Select, { value: industryFilter, onValueChange: setIndustryFilter, children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "Filter by industry" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Industries" }), industryOptions.map(industry => (_jsx(SelectItem, { value: industry.value, children: industry.label }, industry.value)))] })] })] }) }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { children: ["Leads (", filteredLeads.length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Name" }), _jsx(TableHead, { children: "Company" }), _jsx(TableHead, { children: "Industry" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Contact Attempts" }), _jsx(TableHead, { children: "Last Contact" }), _jsx(TableHead, { children: "Value" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: filteredLeads.map((lead) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: lead.name }), _jsx("div", { className: "text-sm text-gray-600", children: lead.email }), _jsx("div", { className: "text-sm text-gray-600", children: lead.phone })] }) }), _jsx(TableCell, { children: lead.company }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", children: industryOptions.find(i => i.value === lead.industry)?.label }) }), _jsx(TableCell, { children: getStatusBadge(lead.status) }), _jsx(TableCell, { children: _jsx("div", { className: "flex items-center gap-1", children: lead.contactAttempts === 0 ? (_jsx(Badge, { variant: "outline", className: "bg-yellow-50 text-yellow-700", children: "Not Contacted" })) : (_jsxs(Badge, { className: "bg-blue-100 text-blue-800", children: [lead.contactAttempts, " attempts"] })) }) }), _jsx(TableCell, { children: lead.lastContactDate ?
                                                        new Date(lead.lastContactDate).toLocaleDateString() :
                                                        'Never' }), _jsx(TableCell, { children: lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()}` : '-' }), _jsx(TableCell, { children: _jsx("div", { className: "flex gap-2", children: _jsxs(Select, { value: lead.status, onValueChange: (value) => updateLeadStatus(lead.id, value), children: [_jsx(SelectTrigger, { className: "w-[140px]", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: statusOptions.map(status => (_jsx(SelectItem, { value: status.value, children: status.label }, status.value))) })] }) }) })] }, lead.id))) })] }) }) })] }), _jsx(Dialog, { open: showUploadDialog, onOpenChange: setShowUploadDialog, children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Import Leads from CSV" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Select CSV File" }), _jsx(Input, { ref: fileInputRef, type: "file", accept: ".csv", onChange: handleFileUpload, className: "mt-2" })] }), uploadedFile && (_jsxs("div", { className: "bg-gray-50 p-3 rounded", children: [_jsxs("p", { className: "text-sm", children: [_jsx("strong", { children: "File:" }), " ", uploadedFile.name] }), _jsxs("p", { className: "text-sm", children: [_jsx("strong", { children: "Size:" }), " ", Math.round(uploadedFile.size / 1024), " KB"] })] })), uploadProgress.total > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Progress" }), _jsxs("span", { children: [uploadProgress.processed, " / ", uploadProgress.total] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2 overflow-hidden", children: _jsx("div", { className: `bg-blue-600 h-2 rounded-full transition-all duration-300 ${uploadProgress.processed === uploadProgress.total ? 'w-full' :
                                                    uploadProgress.processed > uploadProgress.total * 0.8 ? 'w-4/5' :
                                                        uploadProgress.processed > uploadProgress.total * 0.6 ? 'w-3/5' :
                                                            uploadProgress.processed > uploadProgress.total * 0.4 ? 'w-2/5' :
                                                                uploadProgress.processed > uploadProgress.total * 0.2 ? 'w-1/5' : 'w-0'}` }) }), uploadProgress.errors.length > 0 && (_jsxs("div", { className: "bg-red-50 p-2 rounded text-sm text-red-700", children: [_jsx("p", { children: _jsx("strong", { children: "Errors:" }) }), uploadProgress.errors.slice(0, 3).map((error, i) => (_jsxs("p", { children: ["\u2022 ", error] }, i))), uploadProgress.errors.length > 3 && (_jsxs("p", { children: ["... and ", uploadProgress.errors.length - 3, " more errors"] }))] }))] })), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: downloadSampleCSV, variant: "outline", className: "flex-1", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Download Sample"] }), _jsx(Button, { onClick: processCSVUpload, disabled: !uploadedFile || isLoading, className: "flex-1", children: isLoading ? 'Processing...' : 'Import' })] })] })] }) }), _jsx(Dialog, { open: showNewLeadDialog, onOpenChange: setShowNewLeadDialog, children: _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Add New Lead" }) }), _jsxs("form", { onSubmit: handleCreateLead, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Name *" }), _jsx(Input, { value: newLead.name, onChange: (e) => setNewLead(prev => ({ ...prev, name: e.target.value })), required: true })] }), _jsxs("div", { children: [_jsx(Label, { children: "Phone *" }), _jsx(Input, { value: newLead.phone, onChange: (e) => setNewLead(prev => ({ ...prev, phone: e.target.value })), required: true })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Email" }), _jsx(Input, { type: "email", value: newLead.email, onChange: (e) => setNewLead(prev => ({ ...prev, email: e.target.value })) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Company" }), _jsx(Input, { value: newLead.company, onChange: (e) => setNewLead(prev => ({ ...prev, company: e.target.value })) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Industry" }), _jsxs(Select, { value: newLead.industry, onValueChange: (value) => setNewLead(prev => ({ ...prev, industry: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: industryOptions.map(industry => (_jsx(SelectItem, { value: industry.value, children: industry.label }, industry.value))) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Estimated Value" }), _jsx(Input, { type: "number", value: newLead.estimatedValue, onChange: (e) => setNewLead(prev => ({ ...prev, estimatedValue: e.target.value })) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Source" }), _jsx(Input, { value: newLead.source, onChange: (e) => setNewLead(prev => ({ ...prev, source: e.target.value })), placeholder: "e.g., website, referral, cold-call" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Notes" }), _jsx(Textarea, { value: newLead.notes, onChange: (e) => setNewLead(prev => ({ ...prev, notes: e.target.value })), rows: 3 })] }), _jsxs("div", { className: "flex gap-2 pt-4", children: [_jsx(Button, { type: "button", onClick: () => setShowNewLeadDialog(false), variant: "outline", className: "flex-1", children: "Cancel" }), _jsx(Button, { type: "submit", className: "flex-1", children: "Create Lead" })] })] })] }) })] }));
}
