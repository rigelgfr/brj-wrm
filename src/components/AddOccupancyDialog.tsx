// components/AddOccupancyDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/src/components/ui/Button";
import ConfirmDialog from './ui/ConfirmDialog';
import { DialogDescription } from './ui/Dialog';

interface AddOccupancyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const WH_TYPES = ['FZ AB', 'FZ BRJ', 'Bonded', 'CFS', 'PLB'];

const AddOccupancyDialog: React.FC<AddOccupancyDialogProps> = ({
  isOpen,
  onClose,
  onRefresh,
}) => {
  const [sqmData, setSqmData] = useState<Record<string, number>>({});
  const [volData, setVolData] = useState<Record<string, number>>({});
  const [nextPeriod, setNextPeriod] = useState<{ year: number; month: string; week: string; } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLastPeriod();
    }
  }, [isOpen]);

  const fetchLastPeriod = async () => {
    try {
      const response = await fetch("/api/inventory/table");
      const data = await response.json();
      
      if (data.occupancySqm.length > 0) {
        const lastRow = data.occupancySqm[data.occupancySqm.length - 1];
        calculateNextPeriod(lastRow.year, lastRow.month, lastRow.week);
      }
    } catch (error) {
      console.error("Error fetching last period:", error);
    }
  };

  const calculateNextPeriod = (year: number, month: string, week: string) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentWeek = parseInt(week.substring(1));
    
    const monthIndex = months.indexOf(month);
    let nextYear = year;
    let nextMonth = month;
    let nextWeek = currentWeek + 1;

    const lastDay = new Date(year, monthIndex + 1, 0);
    const maxWeeks = Math.ceil((lastDay.getDate() + new Date(year, monthIndex, 1).getDay()) / 7);

    if (nextWeek > maxWeeks) {
      nextWeek = 1;
      if (monthIndex === 11) {
        nextYear++;
        nextMonth = months[0];
      } else {
        nextMonth = months[monthIndex + 1];
      }
    }

    setNextPeriod({
      year: nextYear,
      month: nextMonth,
      week: `W${nextWeek}`,
    });
  };

  const handleSubmit = async () => {
    if (!nextPeriod) return;

    try {
      setIsSubmitting(true);
      
      const sqmPayload = WH_TYPES.map(wh_type => ({
        year: nextPeriod.year,
        month: nextPeriod.month,
        week: nextPeriod.week,
        wh_type,
        space: sqmData[wh_type] || 0,
      }));

      const volPayload = WH_TYPES.map(wh_type => ({
        year: nextPeriod.year,
        month: nextPeriod.month,
        week: nextPeriod.week,
        wh_type,
        space: volData[wh_type] || 0,
      }));

      const response = await fetch('/api/inventory/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sqmData: sqmPayload,
          volData: volPayload,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add records');
      }

      onRefresh();
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setSqmData({});
    setVolData({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Add Occupancy Data for {nextPeriod?.month} {nextPeriod?.year} {nextPeriod?.week}
          </DialogTitle>
          <DialogDescription>
            Empty spaces will automatically be filled by subtracting inserted data with from the warehouse capacity.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-8">
          {/* SQM Section */}
          <div>
            <h3 className="font-semibold mb-4">SQM Occupancy</h3>
            <div className="space-y-4">
              {WH_TYPES.map(wh_type => (
                <div key={`sqm-${wh_type}`} className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor={`sqm-${wh_type}`}>{wh_type}</Label>
                  <Input
                    id={`sqm-${wh_type}`}
                    type="number"
                    value={sqmData[wh_type] || ''}
                    onChange={e => setSqmData(prev => ({
                      ...prev,
                      [wh_type]: parseInt(e.target.value) || 0
                    }))}
                    className="border-green-krnd"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Volume Section */}
          <div>
            <h3 className="font-semibold mb-4">Volume Occupancy</h3>
            <div className="space-y-4">
              {WH_TYPES.map(wh_type => (
                <div key={`vol-${wh_type}`} className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor={`vol-${wh_type}`}>{wh_type}</Label>
                  <Input
                    id={`vol-${wh_type}`}
                    type="number"
                    value={volData[wh_type] || ''}
                    onChange={e => setVolData(prev => ({
                      ...prev,
                      [wh_type]: parseInt(e.target.value) || 0
                    }))}
                    className="border-green-krnd"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} className="border-gray-400">
            Cancel
          </Button>
          <Button
            onClick={() => setShowConfirm(true)}
            disabled={isSubmitting}
          >
            Add Data
          </Button>
        </DialogFooter>

        <ConfirmDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          onContinue={handleSubmit}
          title="Add Occupancy Data"
          description="Do you want to add this occupancy data? This action cannot be undone."
          cancelText="No, Cancel"
          continueText="Yes, Add"
          variant="success"
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddOccupancyDialog;