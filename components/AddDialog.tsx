import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ConfirmDialog from './ui/ConfirmDialog';
import { DialogDescription } from './ui/dialog';

interface AddOccupancyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const WH_TYPES = ['FZ AB', 'FZ BRJ', 'Bonded', 'CFS', 'PLB'];

export const AddOccupancyDialog: React.FC<AddOccupancyDialogProps> = ({
  isOpen,
  onClose,
  onRefresh,
}) => {
  const [sqmData, setSqmData] = useState<Record<string, number>>({});
  const [volData, setVolData] = useState<Record<string, number>>({});
  const [nextPeriod, setNextPeriod] = useState<{ year: number; month: string; week: string; } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateNextPeriod = useCallback((year: number, month: string, week: string) => {
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
  }, []);

  const fetchLastPeriod = useCallback(async () => {
    try {
      const response = await fetch("/api/inventory/v1/table");
      const data = await response.json();
      
      if (data.occupancySqm.length > 0) {
        const lastRow = data.occupancySqm[data.occupancySqm.length - 1];
        calculateNextPeriod(lastRow.year, lastRow.month, lastRow.week);
      }
    } catch (error) {
      console.error("Error fetching last period:", error);
    }
  }, [calculateNextPeriod]);

  useEffect(() => {
    if (isOpen) {
      fetchLastPeriod();
    }
  }, [isOpen, fetchLastPeriod]);

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

      const response = await fetch('/api/inventory/v1/add', {
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

interface AddOccupancy2DialogProps {
    isOpen: boolean;
    onClose: () => void;
    onRefresh: () => void;
}
  
const WAREHOUSE_SECTIONS = [
{ wh_type: 'FZ AB', sections: ['Indoor', 'Canopy 1', 'Canopy 2'] },
{ wh_type: 'FZ BRJ', sections: ['Indoor'] },
{ wh_type: 'GB', sections: ['Indoor'] },
{ wh_type: 'CFS', sections: ['Indoor'] },
{ wh_type: 'PLB', sections: ['Indoor'] }
];

interface OccupancyData {
wh_type: string;
section: string;
occupied_sqm: number;
occupied_vol: number;
}
    
export const AddOccupancy2Dialog: React.FC<AddOccupancy2DialogProps> = ({
    isOpen,
    onClose,
    onRefresh,
}) => {
const [occupancyData, setOccupancyData] = useState<Record<string, OccupancyData>>({});
const [nextPeriod, setNextPeriod] = useState<{ year: number; month: string; week: string; } | null>(null);
const [showConfirm, setShowConfirm] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);

const getLastDayOfMonth = (year: number, month: string): Date => {
    const monthIndex = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ].indexOf(month);
    return new Date(year, monthIndex + 1, 0);
  };
  
  const calculateWeekNumber = (date: Date): string => {
    const lastDayPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0);
    const weekNum = Math.ceil((date.getDate() + lastDayPrevMonth.getDay()) / 7);
    return `W${weekNum}`;
  };
  
  const getNextPeriod = useCallback((year: number, month: string, week: string) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = months.indexOf(month);
    const lastDay = getLastDayOfMonth(year, month);
    const maxWeek = calculateWeekNumber(lastDay);
    const currentWeekNum = parseInt(week.substring(1));
    const maxWeekNum = parseInt(maxWeek.substring(1));
  
    if (currentWeekNum < maxWeekNum) {
      // Next week in same month
      return {
        year,
        month,
        week: `W${currentWeekNum + 1}`
      };
    } else if (currentMonthIndex < 11) {
      // First week of next month
      return {
        year,
        month: months[currentMonthIndex + 1],
        week: 'W1'
      };
    } else {
      // First week of first month of next year
      return {
        year: year + 1,
        month: 'Jan',
        week: 'W1'
      };
    }
  }, []);

    const fetchLastPeriod = useCallback(async () => {
        try {
        const response = await fetch("/api/inventory/v2/table");
        const data = await response.json();
        console.log("Received data from table2:", data);
        
        if (data.occupancy.length > 0) {
            const lastRow = data.occupancy[data.occupancy.length - 1];
            console.log("Last row:", lastRow);
            const nextPeriod = getNextPeriod(lastRow.year, lastRow.month, lastRow.week);
            console.log("Calculated next period:", nextPeriod);
            setNextPeriod(nextPeriod);
        } else {
            // Set default period if no data exists
            const now = new Date();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const defaultPeriod = {
            year: now.getFullYear(),
            month: months[now.getMonth()],
            week: `W${Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 0).getDay()) / 7)}`,
            };
            console.log("Setting default period:", defaultPeriod);
            setNextPeriod(defaultPeriod);
        }
        } catch (error) {
        console.error("Error fetching last period:", error);
        }
    }, [getNextPeriod]);

    useEffect(() => {
        if (isOpen) {
        fetchLastPeriod();
        setOccupancyData({});
        }
    }, [isOpen, fetchLastPeriod]);

    const handleSubmit = async () => {
        if (!nextPeriod) return;

        try {
        setIsSubmitting(true);
        
        const payload = Object.values(occupancyData).filter(data => 
            data.occupied_sqm > 0 || data.occupied_vol > 0
        );

        const response = await fetch('/api/inventory/v2/add', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            occupancyData: payload,
            timeperiod: nextPeriod  // Send the period we want to insert
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Failed to add records');
            return;
        }

        onRefresh();
        onClose();
        } catch (error) {
        console.error('Submit error:', error);
        alert('An error occurred while saving the data. Please try again.');
        } finally {
        setIsSubmitting(false);
        setShowConfirm(false);
        }
    };

    const handleInputChange = (whType: string, section: string, field: 'occupied_sqm' | 'occupied_vol', value: number) => {
        const key = `${whType}-${section}`;
        setOccupancyData(prev => ({
        ...prev,
        [key]: {
            ...prev[key] || { wh_type: whType, section, occupied_sqm: 0, occupied_vol: 0 },
            [field]: value
        }
        }));
    };

    const handleCancel = () => {
        setOccupancyData({});
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
                Empty spaces will automatically be calculated based on warehouse section capacities.
            </DialogDescription>
            </DialogHeader>

            <div className="space-y-8">
            {WAREHOUSE_SECTIONS.map(({ wh_type, sections }) => (
                <div key={wh_type} className="space-y-4">
                <h3 className="font-semibold">{wh_type}</h3>
                {sections.map(section => (
                    <div key={`${wh_type}-${section}`} className="grid grid-cols-3 gap-4 items-center">
                    <Label className="col-span-1">{section}</Label>
                    <div className="space-y-2">
                        <Label htmlFor={`sqm-${wh_type}-${section}`}>SQM</Label>
                        <Input
                        id={`sqm-${wh_type}-${section}`}
                        type="number"
                        value={occupancyData[`${wh_type}-${section}`]?.occupied_sqm || ''}
                        onChange={e => handleInputChange(wh_type, section, 'occupied_sqm', parseInt(e.target.value) || 0)}
                        className="border-green-krnd"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`vol-${wh_type}-${section}`}>CBM</Label>
                        <Input
                        id={`vol-${wh_type}-${section}`}
                        type="number"
                        value={occupancyData[`${wh_type}-${section}`]?.occupied_vol || ''}
                        onChange={e => handleInputChange(wh_type, section, 'occupied_vol', parseInt(e.target.value) || 0)}
                        className="border-green-krnd"
                        />
                    </div>
                    </div>
                ))}
                </div>
            ))}
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
  