import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Student } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Search, Edit, Trash2, Phone, User } from 'lucide-react';
import { format } from 'date-fns';
import { StudentForm } from '@/components/StudentForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Students = () => {
  const [students, setStudents] = useLocalStorage<Student[]>('students', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  const filteredStudents = students
    .filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.fatherName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleAddStudent = (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    setStudents([...students, newStudent]);
    setShowForm(false);
    toast({
      title: "Student Added",
      description: `${newStudent.name} has been added successfully.`
    });
  };

  const handleEditStudent = (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    if (!editingStudent) return;
    
    const updatedStudents = students.map(student =>
      student.id === editingStudent.id
        ? { ...studentData, id: editingStudent.id, createdAt: editingStudent.createdAt }
        : student
    );
    
    setStudents(updatedStudents);
    setEditingStudent(null);
    setShowForm(false);
    toast({
      title: "Student Updated",
      description: `${studentData.name}'s information has been updated.`
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteStudent) return;
    
    const updatedStudents = students.filter(student => student.id !== deleteStudent.id);
    setStudents(updatedStudents);
    setDeleteStudent(null);
    toast({
      title: "Student Deleted",
      description: `${deleteStudent.name} has been removed from the system.`,
      variant: "destructive"
    });
  };

  const openEditForm = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  if (showForm) {
    return (
      <StudentForm
        student={editingStudent}
        onSubmit={editingStudent ? handleEditStudent : handleAddStudent}
        onCancel={closeForm}
      />
    );
  }

  return (
    <Layout title="Students">
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">All Students</h2>
              <p className="text-sm text-muted-foreground">{students.length} students registered</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-soft h-10"
          >
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Students List */}
        <div className="space-y-3">
          {filteredStudents.length === 0 ? (
            <Card className="shadow-card border-0">
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">
                    {students.length === 0 ? 'No Students Added' : 'No Students Found'}
                  </p>
                  <p className="text-sm">
                    {students.length === 0 
                      ? 'Click "New" to add your first student'
                      : 'Try adjusting your search terms'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredStudents.map((student) => (
              <Card key={student.id} className="shadow-card border-0">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{student.name}</h3>
                          <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
                            {student.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Age: {student.age} • {student.gender}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditForm(student)}
                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteStudent(student)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>Father: {student.fatherName}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>F: {student.fatherMobile}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>M: {student.motherMobile}</span>
                        </div>
                      </div>
                      
                      <div className="text-muted-foreground">
                        <span>DOB: {format(new Date(student.dateOfBirth), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteStudent} onOpenChange={() => setDeleteStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteStudent?.name}? This action cannot be undone.
              All attendance records for this student will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <BottomNavigation />
    </Layout>
  );
};