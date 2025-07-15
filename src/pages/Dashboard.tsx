import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Student, AttendanceRecord, MonthlyAttendance } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CalendarDays, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [students] = useLocalStorage<Student[]>('students', []);
  const [attendance] = useLocalStorage<AttendanceRecord[]>('attendance', []);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyAttendance[]>([]);

  useEffect(() => {
    calculateMonthlyStats();
  }, [students, attendance]);

  const calculateMonthlyStats = () => {
    const currentDate = new Date();
    const months = [];
    
    // Get last 6 months including current
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      // Get working days in the month (excluding weekends)
      const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
      const workingDays = allDays.filter(day => !isWeekend(day));
      
      // Get attendance records for this month
      const monthAttendance = attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= monthStart && recordDate <= monthEnd;
      });
      
      // Calculate present days
      const presentRecords = monthAttendance.filter(record => 
        record.status === 'Present'
      );
      
      const totalStudents = students.filter(s => s.status === 'Active').length;
      const totalPossibleAttendance = workingDays.length * totalStudents;
      const totalPresent = presentRecords.length;
      const averageAttendance = totalPossibleAttendance > 0 
        ? (totalPresent / totalPossibleAttendance) * 100 
        : 0;

      months.push({
        month: format(date, 'MMM'),
        year: date.getFullYear(),
        totalStudents,
        averageAttendance: Number(averageAttendance.toFixed(1)),
        totalDays: workingDays.length,
        presentDays: Math.round(totalPresent / Math.max(totalStudents, 1))
      });
    }
    
    setMonthlyStats(months);
  };

  const activeStudents = students.filter(s => s.status === 'Active').length;
  const currentMonthAttendance = monthlyStats[monthlyStats.length - 1]?.averageAttendance || 0;

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Students</p>
                  <p className="text-2xl font-bold text-foreground">{activeStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-foreground">{currentMonthAttendance}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => navigate('/attendance')}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary-glow hover:shadow-soft text-primary-foreground"
            >
              Mark Attendance
            </Button>
            <Button 
              onClick={() => navigate('/students')}
              variant="outline"
              className="w-full h-12 border-primary/20 hover:bg-primary/5"
            >
              Manage Students
            </Button>
          </CardContent>
        </Card>

        {/* Monthly Attendance Chart */}
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Monthly Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyStats.map((month, index) => (
                <div key={`${month.month}-${month.year}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{month.month} {month.year}</p>
                    <p className="text-sm text-muted-foreground">
                      {month.totalStudents} students • {month.totalDays} days
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{month.averageAttendance}%</p>
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500"
                        style={{ width: `${month.averageAttendance}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {monthlyStats.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No attendance data available</p>
                  <p className="text-sm">Start marking attendance to see statistics</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </Layout>
  );
};