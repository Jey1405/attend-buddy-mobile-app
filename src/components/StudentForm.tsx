import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Student } from '@/types';
import { ArrowLeft, Save, X } from 'lucide-react';
import { differenceInYears } from 'date-fns';

interface StudentFormProps {
  student?: Student | null;
  onSubmit: (student: Omit<Student, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const StudentForm = ({ student, onSubmit, onCancel }: StudentFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    age: 0,
    gender: '' as 'Female' | 'Male' | 'Transgender' | '',
    fatherName: '',
    fatherMobile: '',
    motherMobile: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        dateOfBirth: student.dateOfBirth.toISOString().split('T')[0],
        age: student.age,
        gender: student.gender,
        fatherName: student.fatherName,
        fatherMobile: student.fatherMobile,
        motherMobile: student.motherMobile,
        status: student.status
      });
    }
  }, [student]);

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0;
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  const handleDateChange = (date: string) => {
    setFormData(prev => ({
      ...prev,
      dateOfBirth: date,
      age: calculateAge(date)
    }));
  };

  const validateMobile = (mobile: string): boolean => {
    const mobileRegex = /^[0-9]+$/;
    return mobileRegex.test(mobile) && mobile.length >= 10;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Student name is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.fatherName.trim()) {
      newErrors.fatherName = "Father's name is required";
    }

    if (!formData.fatherMobile.trim()) {
      newErrors.fatherMobile = "Father's mobile is required";
    } else if (!validateMobile(formData.fatherMobile)) {
      newErrors.fatherMobile = "Invalid mobile number (numbers only, min 10 digits)";
    }

    if (!formData.motherMobile.trim()) {
      newErrors.motherMobile = "Mother's mobile is required";
    } else if (!validateMobile(formData.motherMobile)) {
      newErrors.motherMobile = "Invalid mobile number (numbers only, min 10 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      dateOfBirth: new Date(formData.dateOfBirth),
      age: formData.age,
      gender: formData.gender as 'Female' | 'Male' | 'Transgender',
      fatherName: formData.fatherName.trim(),
      fatherMobile: formData.fatherMobile.trim(),
      motherMobile: formData.motherMobile.trim(),
      status: formData.status
    });
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      dateOfBirth: '',
      age: 0,
      gender: '',
      fatherName: '',
      fatherMobile: '',
      motherMobile: '',
      status: 'Active'
    });
    setErrors({});
    onCancel();
  };

  return (
    <Layout title={student ? 'Edit Student' : 'Add New Student'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {student ? 'Edit Student' : 'Add New Student'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {student ? 'Update student information' : 'Enter student details below'}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Student Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter student name"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className={errors.dateOfBirth ? 'border-destructive' : ''}
                />
                {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
              </div>

              {/* Age (Auto-calculated) */}
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  value={formData.age}
                  readOnly
                  className="bg-muted"
                  placeholder="Age will be calculated automatically"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as any }))}
                >
                  <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Transgender">Transgender</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
              </div>

              {/* Father's Name */}
              <div className="space-y-2">
                <Label htmlFor="fatherName">Father's Name *</Label>
                <Input
                  id="fatherName"
                  value={formData.fatherName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                  placeholder="Enter father's name"
                  className={errors.fatherName ? 'border-destructive' : ''}
                />
                {errors.fatherName && <p className="text-sm text-destructive">{errors.fatherName}</p>}
              </div>

              {/* Father's Mobile */}
              <div className="space-y-2">
                <Label htmlFor="fatherMobile">Father's Mobile No *</Label>
                <Input
                  id="fatherMobile"
                  value={formData.fatherMobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData(prev => ({ ...prev, fatherMobile: value }));
                  }}
                  placeholder="Enter father's mobile number"
                  className={errors.fatherMobile ? 'border-destructive' : ''}
                />
                {errors.fatherMobile && <p className="text-sm text-destructive">{errors.fatherMobile}</p>}
              </div>

              {/* Mother's Mobile */}
              <div className="space-y-2">
                <Label htmlFor="motherMobile">Mother's Mobile No *</Label>
                <Input
                  id="motherMobile"
                  value={formData.motherMobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData(prev => ({ ...prev, motherMobile: value }));
                  }}
                  placeholder="Enter mother's mobile number"
                  className={errors.motherMobile ? 'border-destructive' : ''}
                />
                {errors.motherMobile && <p className="text-sm text-destructive">{errors.motherMobile}</p>}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'Active' | 'Inactive' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-gradient-to-r from-success to-success hover:shadow-soft text-success-foreground"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Submit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 h-12 border-destructive/20 text-destructive hover:bg-destructive/5"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};