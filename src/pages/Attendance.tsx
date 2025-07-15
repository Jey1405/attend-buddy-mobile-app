import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Student, AttendanceRecord } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CheckCircle, X, Clock, Home, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

const attendanceOptions = [
  { value: 'Present', label: 'Present', icon: CheckCircle, color: 'bg-success text-success-foreground' },
  { value: 'Absent', label: 'Absent', icon: X, color: 'bg-destructive text-destructive-foreground' },
  { value: 'Leave', label: 'Leave', icon: Clock, color: 'bg-warning text-warning-foreground' },
  { value: 'Holiday', label: 'Holiday', icon: Home, color: 'bg-muted text-muted-foreground' },
  { value: 'No Class', label: 'No Class', icon: BookOpen, color: 'bg-secondary text-secondary-foreground' },
] as const;

export const Attendance = () => {
  const [students] = useLocalStorage<Student[]>('students', []);
  const [attendance, setAttendance] = useLocalStorage<AttendanceRecord[]>('attendance', []);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentAttendance, setCurrentAttendance] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Sort students alphabetically by name
  const activeStudents = students
    .filter(student => student.status === 'Active')
    .sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    // Load existing attendance for selected date
    const dateAttendance = attendance.filter(record => 
      format(new Date(record.date), 'yyyy-MM-dd') === selectedDate
    );
    
    const attendanceMap: Record<string, string> = {};
    dateAttendance.forEach(record => {
      attendanceMap[record.studentId] = record.status;
    });
    
    setCurrentAttendance(attendanceMap);
  }, [selectedDate, attendance]);

  const handleAttendanceChange = (studentId: string, status: string) => {
    setCurrentAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const saveAttendance = () => {
    const date = new Date(selectedDate);
    const updatedAttendance = [...attendance];
    
    // Remove existing attendance for this date
    const filteredAttendance = updatedAttendance.filter(record => 
      format(new Date(record.date), 'yyyy-MM-dd') !== selectedDate
    );
    
    // Add new attendance records
    Object.entries(currentAttendance).forEach(([studentId, status]) => {
      if (status) {
        filteredAttendance.push({
          id: `${studentId}-${selectedDate}`,
          studentId,
          date,
          status: status as AttendanceRecord['status']
        });
      }
    });
    
    setAttendance(filteredAttendance);
    toast({
      title: "Attendance Saved",
      description: `Attendance for ${format(date, 'MMMM d, yyyy')} has been saved successfully.`
    });
  };

  const getAttendanceStats = () => {
    const total = Object.keys(currentAttendance).length;
    const present = Object.values(currentAttendance).filter(status => status === 'Present').length;
    const absent = Object.values(currentAttendance).filter(status => status === 'Absent').length;
    
    return { total, present, absent };
  };

  const stats = getAttendanceStats();

  return (
    <Layout title="Mark Attendance">
      <div className="space-y-6">
        {/* Date Selection */}
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Attendance Date</p>
                  <p className="font-semibold text-foreground">
                    {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {Object.keys(currentAttendance).length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="shadow-card border-0">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card className="shadow-card border-0">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-success">{stats.present}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </CardContent>
            </Card>
            <Card className="shadow-card border-0">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-destructive">{stats.absent}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Student List */}
        <div className="space-y-3">
          {activeStudents.length === 0 ? (
            <Card className="shadow-card border-0">
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No Active Students</p>
                  <p className="text-sm">Add students to start marking attendance</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            activeStudents.map((student) => (
              <Card key={student.id} className="shadow-card border-0">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Age: {student.age} • {student.gender}
                        </p>
                      </div>
                      {currentAttendance[student.id] && (
                        <Badge className={attendanceOptions.find(opt => opt.value === currentAttendance[student.id])?.color}>
                          {currentAttendance[student.id]}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {attendanceOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = currentAttendance[student.id] === option.value;
                        
                        return (
                          <Button
                            key={option.value}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleAttendanceChange(student.id, option.value)}
                            className={`h-10 ${isSelected ? option.color : 'hover:bg-muted/50'}`}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {option.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Save Button */}
        {activeStudents.length > 0 && (
          <div className="pb-4">
            <Button 
              onClick={saveAttendance}
              className="w-full h-12 bg-gradient-to-r from-success to-success hover:shadow-soft text-success-foreground"
              disabled={Object.keys(currentAttendance).length === 0}
            >
              Save Attendance
            </Button>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </Layout>
  );
};