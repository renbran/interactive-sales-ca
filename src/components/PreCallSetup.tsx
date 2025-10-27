import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone } from '@phosphor-icons/react';
import { ProspectInfo, CallObjective } from '@/lib/types';

interface PreCallSetupProps {
  open: boolean;
  onStart: (prospect: ProspectInfo, objective: CallObjective) => void;
}

export default function PreCallSetup({ open, onStart }: PreCallSetupProps) {
  const [prospect, setProspect] = useState<ProspectInfo>({
    name: '',
    company: '',
    industry: '',
    phone: '',
  });
  const [objective, setObjective] = useState<CallObjective>('cold-call');

  const isValid = prospect.name && prospect.company && prospect.phone;

  const handleStart = () => {
    if (isValid) {
      onStart(prospect, objective);
      setProspect({ name: '', company: '', industry: '', phone: '' });
      setObjective('cold-call');
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">New Call Setup</DialogTitle>
          <DialogDescription>
            Enter prospect information to begin your call
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Prospect Name *</Label>
            <Input
              id="name"
              value={prospect.name}
              onChange={(e) => setProspect({ ...prospect, name: e.target.value })}
              placeholder="John Smith"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              value={prospect.company}
              onChange={(e) => setProspect({ ...prospect, company: e.target.value })}
              placeholder="Acme Corp"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={prospect.industry}
              onChange={(e) => setProspect({ ...prospect, industry: e.target.value })}
              placeholder="Manufacturing, Healthcare, etc."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={prospect.phone}
              onChange={(e) => setProspect({ ...prospect, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="objective">Call Objective</Label>
            <Select value={objective} onValueChange={(val) => setObjective(val as CallObjective)}>
              <SelectTrigger id="objective">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cold-call">Cold Call</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
                <SelectItem value="demo-booking">Demo Booking</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full bg-accent hover:bg-accent/90"
          disabled={!isValid}
          onClick={handleStart}
        >
          <Phone weight="fill" className="mr-2 h-5 w-5" />
          Start Call
        </Button>
      </DialogContent>
    </Dialog>
  );
}
