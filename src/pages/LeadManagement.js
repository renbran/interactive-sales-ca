import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// Lead Management System for Scholarix CRM
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Buildings, User, CurrencyDollar, MagnifyingGlass, PhoneCall, ChatCircle, PencilSimple } from '@phosphor-icons/react';
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
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [industryFilter, setIndustryFilter] = useState('all');
    const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newLead, setNewLead] = useState({
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
            }
            else {
                console.error('Failed to fetch leads');
            }
        }
        catch (error) {
            console.error('Error fetching leads:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreateLead = async (e) => {
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
            }
            else {
                console.error('Failed to create lead');
            }
        }
        catch (error) {
            console.error('Error creating lead:', error);
        }
        finally {
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
    const startCall = (lead) => {
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
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading leads..." })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Lead Management" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage your prospects and track conversions" })] }), _jsxs(Dialog, { open: showNewLeadDialog, onOpenChange: setShowNewLeadDialog, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "New Lead"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Create New Lead" }) }), _jsxs("form", { onSubmit: handleCreateLead, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "name", children: "Full Name *" }), _jsx(Input, { id: "name", value: newLead.name, onChange: (e) => setNewLead({ ...newLead, name: e.target.value }), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "phone", children: "Phone *" }), _jsx(Input, { id: "phone", value: newLead.phone, onChange: (e) => setNewLead({ ...newLead, phone: e.target.value }), required: true })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", value: newLead.email, onChange: (e) => setNewLead({ ...newLead, email: e.target.value }) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "company", children: "Company" }), _jsx(Input, { id: "company", value: newLead.company, onChange: (e) => setNewLead({ ...newLead, company: e.target.value }) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "industry", children: "Industry *" }), _jsxs(Select, { value: newLead.industry, onValueChange: (value) => setNewLead({ ...newLead, industry: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Object.entries(industryLabels).map(([value, label]) => (_jsx(SelectItem, { value: value, children: label }, value))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "source", children: "Source" }), _jsx(Input, { id: "source", value: newLead.source, onChange: (e) => setNewLead({ ...newLead, source: e.target.value }), placeholder: "Website, referral, cold call..." })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "estimatedValue", children: "Estimated Value (AED)" }), _jsx(Input, { id: "estimatedValue", type: "number", value: newLead.estimatedValue, onChange: (e) => setNewLead({ ...newLead, estimatedValue: e.target.value }), placeholder: "25000" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "probability", children: "Probability (%)" }), _jsxs(Select, { value: newLead.probability, onValueChange: (value) => setNewLead({ ...newLead, probability: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "10", children: "10% - Cold" }), _jsx(SelectItem, { value: "25", children: "25% - Interested" }), _jsx(SelectItem, { value: "50", children: "50% - Qualified" }), _jsx(SelectItem, { value: "75", children: "75% - Hot" }), _jsx(SelectItem, { value: "90", children: "90% - Closing" })] })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "notes", children: "Notes" }), _jsx(Textarea, { id: "notes", value: newLead.notes, onChange: (e) => setNewLead({ ...newLead, notes: e.target.value }), placeholder: "Initial notes about this lead...", rows: 3 })] }), _jsxs("div", { className: "flex justify-end space-x-2 pt-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setShowNewLeadDialog(false), children: "Cancel" }), _jsx(Button, { type: "submit", disabled: isSubmitting, children: isSubmitting ? 'Creating...' : 'Create Lead' })] })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(User, { className: "h-8 w-8 text-gray-600" }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-2xl font-semibold", children: stats.total }), _jsx("p", { className: "text-sm text-gray-600", children: "Total Leads" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-8 h-8 bg-gray-100 rounded flex items-center justify-center", children: _jsx("span", { className: "text-sm font-medium", children: stats.new }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-2xl font-semibold", children: stats.new }), _jsx("p", { className: "text-sm text-gray-600", children: "New Leads" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-8 h-8 bg-yellow-100 rounded flex items-center justify-center", children: _jsx("span", { className: "text-sm font-medium text-yellow-800", children: stats.qualified }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-2xl font-semibold", children: stats.qualified }), _jsx("p", { className: "text-sm text-gray-600", children: "Qualified" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-8 h-8 bg-green-100 rounded flex items-center justify-center", children: _jsx("span", { className: "text-sm font-medium text-green-800", children: stats.closedWon }) }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-2xl font-semibold", children: stats.closedWon }), _jsx("p", { className: "text-sm text-gray-600", children: "Closed Won" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(CurrencyDollar, { className: "h-8 w-8 text-green-600" }), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-2xl font-semibold", children: stats.totalValue.toLocaleString() }), _jsx("p", { className: "text-sm text-gray-600", children: "AED Revenue" })] })] }) }) })] }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsx("div", { className: "flex-1 min-w-64", children: _jsxs("div", { className: "relative", children: [_jsx(MagnifyingGlass, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { placeholder: "Search leads by name, company, phone, or email...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }) }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "Filter by status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Statuses" }), Object.entries(statusLabels).map(([value, label]) => (_jsx(SelectItem, { value: value, children: label }, value)))] })] }), _jsxs(Select, { value: industryFilter, onValueChange: setIndustryFilter, children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "Filter by industry" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Industries" }), Object.entries(industryLabels).map(([value, label]) => (_jsx(SelectItem, { value: value, children: label }, value)))] })] })] }) }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { children: ["Leads (", filteredLeads.length, ")"] }) }), _jsxs(CardContent, { className: "p-0", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Name" }), _jsx(TableHead, { children: "Company" }), _jsx(TableHead, { children: "Industry" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Assigned To" }), _jsx(TableHead, { children: "Last Contact" }), _jsx(TableHead, { children: "Value" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: filteredLeads.map((lead) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: lead.name }), _jsxs("div", { className: "text-sm text-gray-600", children: [lead.phone, " ", lead.email && `• ${lead.email}`] })] }) }), _jsx(TableCell, { children: _jsx("div", { className: "flex items-center", children: lead.company && (_jsxs(_Fragment, { children: [_jsx(Buildings, { className: "h-4 w-4 text-gray-400 mr-1" }), lead.company] })) }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", children: industryLabels[lead.industry] }) }), _jsx(TableCell, { children: _jsx(Badge, { className: statusColors[lead.status], children: statusLabels[lead.status] }) }), _jsx(TableCell, { children: lead.assignedToName || 'Unassigned' }), _jsx(TableCell, { children: lead.lastCall ? (_jsxs("div", { className: "text-sm", children: [new Date(lead.lastCall).toLocaleDateString(), _jsxs("div", { className: "text-xs text-gray-500", children: [lead.callsCount, " call", lead.callsCount !== 1 ? 's' : ''] })] })) : (_jsx("span", { className: "text-gray-400", children: "No calls" })) }), _jsx(TableCell, { children: lead.estimatedValue ? (_jsxs("div", { children: [_jsxs("div", { className: "font-medium", children: [lead.estimatedValue.toLocaleString(), " AED"] }), _jsxs("div", { className: "text-xs text-gray-500", children: [lead.probability, "% probability"] })] })) : ('-') }), _jsx(TableCell, { children: _jsxs("div", { className: "flex space-x-1", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => startCall(lead), title: "Start Call", children: _jsx(PhoneCall, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "outline", title: "Send Message", children: _jsx(ChatCircle, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "outline", title: "Edit Lead", children: _jsx(PencilSimple, { className: "h-4 w-4" }) })] }) })] }, lead.id))) })] }) }), filteredLeads.length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx(User, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "No leads found matching your criteria." }), _jsxs(Button, { className: "mt-4", onClick: () => setShowNewLeadDialog(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create First Lead"] })] }))] })] })] }));
}
