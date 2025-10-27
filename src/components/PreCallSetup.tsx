import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, X } from '@phosphor-icons/react';
import { ProspectInfo, CallObjective, Industry } from '@/lib/types';
import { getIndustryPain } from '@/lib/scholarixScript';

interface PreCallSetupProps {
  open: boolean;
  onClose: () => void;
  onStart: (prospect: ProspectInfo, objective: CallObjective) => void;
}

export default function PreCallSetup({ open, onClose, onStart }: PreCallSetupProps) {
  const [prospect, setProspect] = useState<ProspectInfo>({
    name: '',
    title: '',
    company: '',
    industry: 'real-estate',
    phone: '',
    email: '',
    whatsapp: ''
  });
  const [objective, setObjective] = useState<CallObjective>('cold-call');

  const isValid = prospect.name && prospect.company && prospect.phone && prospect.industry;

  const handleStart = () => {
    if (isValid) {
      onStart(prospect, objective);
      setProspect({
        name: '',
        title: '',
        company: '',
        industry: 'real-estate',
        phone: '',
        email: '',
        whatsapp: ''
      });
      setObjective('cold-call');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Phone weight="fill" className="h-6 w-6 text-accent" />
            Pre-Call Setup
          </DialogTitle>
          <DialogDescription>
            Complete prospect intel before starting the call. This information will auto-fill in your script.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Prospect Name *</Label>
              <Input
                id="name"
                placeholder="Mohammed Al-Rashid"
                value={prospect.name}
                onChange={(e) => setProspect({ ...prospect, name: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Managing Director"
                value={prospect.title}
                onChange={(e) => setProspect({ ...prospect, title: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="company">Company Name *</Label>
            <Input
              id="company"
              placeholder="ABC Real Estate LLC"
              value={prospect.company}
              onChange={(e) => setProspect({ ...prospect, company: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="industry">Industry *</Label>
            <Select 
              value={prospect.industry} 
              onValueChange={(value) => setProspect({ ...prospect, industry: value as Industry })}
            >
              <SelectTrigger id="industry">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="real-estate">Real Estate</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="trading">Trading</SelectItem>
                <SelectItem value="logistics">Logistics</SelectItem>
                <SelectItem value="consulting">Consulting</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Likely pain: {getIndustryPain(prospect.industry)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+971 50 123 4567"
                value={prospect.phone}
                onChange={(e) => setProspect({ ...prospect, phone: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="whatsapp">WhatsApp (Optional)</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+971 50 123 4567"
                value={prospect.whatsapp}
                onChange={(e) => setProspect({ ...prospect, whatsapp: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="m.alrashid@company.ae"
              value={prospect.email}
              onChange={(e) => setProspect({ ...prospect, email: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="objective">Call Objective</Label>
            <Select 
              value={objective} 
              onValueChange={(value) => setObjective(value as CallObjective)}
            >
              <SelectTrigger id="objective">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cold-call">Cold Call (First Contact)</SelectItem>
                <SelectItem value="follow-up">Follow-Up Call</SelectItem>
                <SelectItem value="demo-confirmation">Demo Confirmation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-accent/10 p-4 border border-accent/20">
            <div className="text-sm font-medium text-accent mb-2">📋 Pre-Call Mental Frame</div>
            <div className="text-xs text-foreground/80 space-y-1">
              <div>✅ Standing up (energy = confidence)</div>
              <div>✅ Smiling (vocal warmth transfers)</div>
              <div>✅ Pen + notepad ready</div>
              <div>✅ Remember: You're saving them from bleeding money daily</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            onClick={handleStart} 
            disabled={!isValid}
            className="bg-accent hover:bg-accent/90"
          >
            <Phone weight="fill" className="mr-2 h-4 w-4" />
            Start Call
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
