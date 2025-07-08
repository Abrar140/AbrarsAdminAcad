// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Button, TextField, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Modal, IconButton, Tooltip, Snackbar, Alert,useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Sidebar from '../Components/Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../../supabase-client'; // adjust the path if needed
import { MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';



const Grade = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const location = useLocation();
  const classInfo = location.state?.classInfo;

  const [students, setStudents] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);

  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [uploadingAssignment, setUploadingAssignment] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  
  // Track assignments with grades
  const [assignmentsWithGrades, setAssignmentsWithGrades] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false); // Track the deletion progress
  const [isSubmittingMarks, setIsSubmittingMarks] = useState(false); // Track marks submission progress
  const [hasExistingGrades, setHasExistingGrades] = useState(false); // add at the top with other state
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');


  // Added Snackbar state from Attendance.jsx
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Added showSnackbar function from Attendance.jsx
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Added handleCloseSnackbar function from Attendance.jsx
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
  };

  
  useEffect(() => {
    if (classInfo) {
      console.log('Received Class Info in Grade:', classInfo);
      console.log('Available subjects:', classInfo.allSubjects);
      fetchStudents();
      fetchAssignments();
    }
  }, [classInfo]);


  
  const fetchStudents = async () => {
    try {
      const combinedClassSection = `${classInfo.sections.classes.class_name}${classInfo.sections.section_name}`;
      console.log('Fetching students for admission_class:', combinedClassSection);
  
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('admission_class', combinedClassSection);
  
      if (error) {
        throw error;
      }
  
      const studentList = data.map((student) => ({
        id: student.id,
        registration_no: student.registration_no,
        full_name: student.full_name,
        marks: "", // initialize empty marks
      }));
  
      console.log('Fetched students:', studentList);
      setStudents(studentList);
    } catch (error) {
      console.error('Error fetching students:', error.message);
      // Added snackbar for errors
      showSnackbar('Error fetching students.', 'error');
    } finally {
      setLoading(false);
    }
  };

 const [formData, setFormData] = useState({ 
  name: "", 
  subject: classInfo?.allSubjects?.[0]?.name || "", 
  subject_id: classInfo?.allSubjects?.[0]?.rawData?.subjects?.[0] || null,
  description: "", 
  file: null,
   deadline: "", // Add deadline field
  total_marks: "" // Add total marks field
});

  

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

      // Prevent negative values for total_marks
  if (name === 'total_marks' && value < 0) {
    showSnackbar("Total marks cannot be negative", "warning");
    return;
  }
    
    // If the subject is being changed, also update the subject_id
    if (name === 'subject') {
  let newSubjectId = null;

  if (classInfo.allSubjects) {
    const foundSubject = classInfo.allSubjects.find(subject => subject.name === value);
    if (foundSubject) {
      newSubjectId = foundSubject.rawData.subjects.find(id => id) || null;
    }
  }

  setFormData({ 
    ...formData, 
    [name]: value,
    subject_id: newSubjectId
  });
}
 else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  // Fetch assignments and check which ones have grades
  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    try {
      // First, fetch all assignments
      const { data, error } = await supabase
      .from('assignments_quizzes')
      .select(`
        id,
        name,
        description,
        file_url,
        subject_id,
        deadline,
        total_marks,
        subjects (
          subject_name
        )
      `)
      .eq('teacher_id', classInfo.TeacherID)
      .eq('class_id', classInfo.sections.class_id)
      .eq('section_id', classInfo.section_id)
      .order('created_at', { ascending: false });  // Newest first
    
      if (error) {
        throw error;
      }

      console.log('Fetched assignments:', data);

      // Next, check which assignments have grades
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('assignment_quiz_id, marks')
        .in('assignment_quiz_id', data.map(a => a.id));
      
      if (gradesError) {
        throw gradesError;
      }

      // Create a Set of assignment IDs that have grades
      const assignmentIdsWithGrades = new Set(gradesData.map(g => g.assignment_quiz_id));
      setAssignmentsWithGrades(Array.from(assignmentIdsWithGrades));

      // Map assignments into the correct format for rendering
      const assignmentsData = data.map((assignment) => ({
        id: assignment.id,
        name: assignment.name,
        description: assignment.description,
        file: assignment.file_url
        ? {
            name: decodeURIComponent(assignment.file_url.split('/').pop().replace(/^\d+-\d+-/, '')),
            url: assignment.file_url,
          }
        : null,
        subject_name: assignment.subjects?.subject_name || "Subject not found",
        hasGrades: assignmentIdsWithGrades.has(assignment.id),
        deadline: assignment.deadline, // Add deadline
        total_marks: assignment.total_marks // Add total marks
      }));
      
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error fetching assignments:', error.message);
      // Added snackbar for errors
      showSnackbar('Error fetching assignments.', 'error');
    } finally {
      setLoadingAssignments(false);
    }
  };

  const openDeleteDialog = (assignment) => {
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setAssignmentToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    setIsDeleting(true); // Set deleting state to true when starting the deletion process
    try {
      // First, get the assignment details to obtain the file URL
      const { data: assignmentData, error: fetchError } = await supabase
        .from('assignments_quizzes')
        .select('file_url')
        .eq('id', assignmentToDelete.id)
        .single();
  
      if (fetchError) throw fetchError;
  
      // Check if there are any grades for this assignment
      const { data: gradesData, error: checkError } = await supabase
        .from('grades')
        .select('id')
        .eq('assignment_quiz_id', assignmentToDelete.id)
        .limit(1);
  
      if (checkError) throw checkError;
  
      // If grades exist, delete them first
      if (gradesData && gradesData.length > 0) {
        const { error: gradeError } = await supabase
          .from('grades')
          .delete()
          .eq('assignment_quiz_id', assignmentToDelete.id);
  
        if (gradeError) throw gradeError;
      }
  
      // Delete the assignment from the database
      const { error: assignmentError } = await supabase
        .from('assignments_quizzes')
        .delete()
        .eq('id', assignmentToDelete.id);
  
      if (assignmentError) throw assignmentError;
  
      // If there's a file associated with this assignment, delete it from storage
      if (assignmentData && assignmentData.file_url) {
        try {
          const fileUrl = assignmentData.file_url;
          console.log('File URL to process:', fileUrl);
          
          
          let filePath;
          
          // Check if the URL matches the expected format
          if (fileUrl.includes('/public/assessments/')) {
            // Parse the path after 'public/assessments/'
            filePath = fileUrl.split('/public/assessments/')[1];
            console.log('Extracted path using public/assessments pattern:', filePath);
          } else {
            // Fallback to a more generic approach - get everything after the last instance of "assessments/"
            const parts = fileUrl.split('assessments/');
            filePath = parts[parts.length - 1];
            console.log('Extracted path using generic pattern:', filePath);
          }
          
          if (filePath) {
            console.log('Attempting to delete file with path:', filePath);
            
            const { data: deleteResult, error: deleteError } = await supabase
              .storage
              .from('assessments')
              .remove([filePath]);
              
            console.log('Delete result:', deleteResult);
            
            if (deleteError) {
              console.error('Storage deletion error:', deleteError);
              throw deleteError;
            } else {
              console.log('File successfully deleted');
            }
          } else {
            console.error('Could not extract a valid file path from URL:', fileUrl);
            showSnackbar('Could not determine file path for deletion', 'warning');
          }
        } catch (storageError) {
          console.error('Storage operation failed:', storageError);
          showSnackbar(`File deletion failed: ${storageError.message}`, 'warning');
        }
      }
  
      showSnackbar('Assignment deleted successfully!', 'success');
      
      // Update the local state to remove the deleted assignment
      setAssignments(prev => prev.filter(a => a.id !== assignmentToDelete.id));
    } catch (error) {
      console.error('Error deleting assignment:', error.message);
      showSnackbar(`Failed to delete assignment: ${error.message}`, 'error');
    } finally {
      closeDeleteDialog();
      setIsDeleting(false); // Set deleting state to false after deletion
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadingAssignment(true);

     // Validate required fields
  if (!formData.deadline) {
    showSnackbar('Please select a deadline', 'error');
    setUploadingAssignment(false);
    return;
  }

  // Validate total marks
  if (!formData.total_marks || formData.total_marks <= 0) {
    showSnackbar('Total marks must be a positive number', 'error');
    setUploadingAssignment(false);
    return;
  }

  // Validate deadline is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(formData.deadline);

  if (selectedDate < today) {
    showSnackbar('Deadline cannot be in the past', 'error');
    setUploadingAssignment(false);
    return;
  }
  
    let fileUrl = null;

    if (formData.file) {
      const file = formData.file;

      // Generate a unique filename using timestamp + random number
      const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const uniqueFileName = `${uniqueSuffix}-${file.name}`;
      const filePath = `upload/${uniqueFileName}`;

      try {
        const { error: uploadError } = await supabase
          .storage
          .from('assessments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Fix: Get the correct public URL format
        const { data } = supabase.storage.from('assessments').getPublicUrl(filePath);
        fileUrl = data.publicUrl; // Use data.publicUrl instead of .publicURL
      } catch (error) {
        console.error('Error uploading file:', error.message);
        showSnackbar('Error uploading file.', 'error'); // Added snackbar
        setUploadingAssignment(false);
        return;
      }
    }

    try {
      const { error } = await supabase
        .from('assignments_quizzes')
        .insert([{
          name: formData.name,
          subject_id: formData.subject_id, // Use the selected subject_id
          description: formData.description || null,
          file_url: fileUrl || null,
          teacher_id: classInfo.TeacherID,
          class_id: classInfo.sections.class_id,
          section_id: classInfo.section_id,
          deadline: formData.deadline, // Add deadline
          total_marks: formData.total_marks // Add total marks
        }]);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      console.log('Inserted assignment with subject_id:', formData.subject_id);
      await fetchAssignments();
      showSnackbar('Assignment created successfully!', 'success'); // Added snackbar

      setFormData({ name: "", subject: "", description: "", file: null, deadline: "", total_marks: "" }); // Reset form data
      handleCloseModal();

    } catch (error) {
      console.error('Error inserting assignment:', error.message);
      showSnackbar('Error creating assignment.', 'error'); // Added snackbar
    } finally {
      setUploadingAssignment(false);
    }
  };


    
  const handleAssignmentClick = async (assignment) => {
    setSelectedAssignment(assignment);
    setLoadingGrades(true); // Start loading

    try {
      const { data: gradesData, error } = await supabase
        .from('grades')
        .select('registration_no, marks')
        .eq('assignment_quiz_id', assignment.id);

      if (error) throw error;

      setHasExistingGrades(gradesData.length > 0); // set flag

      // Update assignment's hasGrades status
      if (gradesData && gradesData.length > 0) {
        setAssignmentsWithGrades(prev => 
          prev.includes(assignment.id) ? prev : [...prev, assignment.id]
        );
      }


      // Merge marks into student list
      const updatedStudents = students.map(student => {
        const gradeEntry = gradesData.find(g => g.registration_no === student.registration_no);
        return {
          ...student,
          marks: gradeEntry ? gradeEntry.marks : "",
        };
      });

      setStudents(updatedStudents);
      // Added check to show appropriate message
      if (gradesData.length > 0) {
        showSnackbar('Existing grades loaded for update.', 'info');
      } else {
        showSnackbar('No grades found. Ready to submit.', 'info');
      }
    } catch (error) {
      console.error("Error fetching existing grades:", error.message);
      showSnackbar('Error fetching grades.', 'error');
    } finally {
      setLoadingGrades(false); // Stop loading
    }
  };


  const handleMarksChange = (index, value) => {
  // Don't allow negative numbers
  if (value < 0) {
    showSnackbar("Marks cannot be negative", "warning");
    return;
  }
  
  // Validate against total marks if available
  if (selectedAssignment?.total_marks && value > selectedAssignment.total_marks) {
    showSnackbar(`Marks cannot exceed total marks (${selectedAssignment.total_marks})`, "warning");
    return;
  }

  const updated = [...students];
  updated[index].marks = value;
  setStudents(updated);
};

  const handleMarksSubmit = async () => {
    if (!selectedAssignment || !students.length) return;

    // Check for any empty marks
  const hasEmptyMarks = students.some(student => student.marks === "" || student.marks === null);

  if (hasEmptyMarks) {
    showSnackbar("Please fill in all marks before submitting.", "warning");
    return;
  }
  
    setIsSubmittingMarks(true); // Set submitting state to true when marks are being submitted

    try {
      const gradeData = students
        .filter((student) => student.marks !== "")
        .map((student) => ({
          assignment_quiz_id: selectedAssignment.id,
          teacher_id: classInfo.TeacherID,
          class_id: classInfo.sections.class_id,
          section_id: classInfo.section_id,
          registration_no: student.registration_no,
          full_name: student.full_name,
          marks: parseFloat(student.marks),
        }));
  
      const { error } = await supabase
        .from('grades')
        .upsert(gradeData, {
          onConflict: ['assignment_quiz_id', 'registration_no'], // ensure unique per assignment & student
        });
  
      if (error) throw error;
  
      // Add this assignment to the list of assignments with grades
      if (gradeData.length > 0) {
        setAssignmentsWithGrades(prev => 
          prev.includes(selectedAssignment.id) ? prev : [...prev, selectedAssignment.id]
        );
        
        // Update the assignments list to reflect the change
        setAssignments(prev => 
          prev.map(a => a.id === selectedAssignment.id ? {...a, hasGrades: true} : a)
        );
      }
  
      // Changed alert to snackbar
      showSnackbar('Marks saved successfully!', 'success');
      // setSelectedAssignment(null);
    } catch (error) {
      console.error("Error saving marks:", error.message);
      // Changed alert to snackbar
      showSnackbar('Failed to save marks.', 'error');
    } finally{
      setIsSubmittingMarks(false); // Set submitting state to false after marks submission
    }
  };
  

  const handleBack = () => {
    setSelectedAssignment(null);

    // Reset the marks of all students when going back to the assignments view
    const resetStudentsMarks = students.map((student) => ({
      ...student,
      marks: "", // Reset marks to an empty string
    }));
    
    setStudents(resetStudentsMarks); // Update the state with the reset marks
  };


  const handleDownload = (file) => {
    if (file && file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.setAttribute('download', file.name); // optional: lets browser name the file
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSnackbar(`Downloading ${file.name}...`, 'info');
    }
  };
  

 const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 500 },
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: { xs: 2, sm: 4 },
};



  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (assignment.description && assignment.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Sidebar />
      <Box
  component="main"
  sx={{
    flexGrow: 1,
    p: { xs: 2, sm: 2, md: 3 },
    ml: { xs: 0, md: '240px' },
    mt: { xs: '64px', md: 0 },
    height: '100vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  }}
>

        <Box sx={{ flexGrow: 1 }}>
          {!selectedAssignment ? (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12}>
             <Box
  sx={{
    color: '#1a1a2e',
    mb: 3,
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    alignItems: { xs: 'flex-start', sm: 'center' },
    justifyContent: 'space-between',
    gap: 2
  }}
>


                 <Box sx={{ display: 'flex', gap: 1 }}>
                 <IconButton onClick={() => navigate(-1)} sx={{ color: theme.palette.primary.main, mr: 2, fontSize: 'medium' }}>
                  <ArrowBackIcon fontSize="large" />
                </IconButton>
  <Typography variant="h4" sx={{fontWeight: 700, color: theme.palette.text.primary}}>
    Assignment & Grade Management
  </Typography>
 </Box>
   <Button
  variant="contained"
  startIcon={<AddIcon />}
  onClick={handleOpenModal}
  sx={{
    backgroundColor: theme.palette.primary.main,
    '&:hover': { backgroundColor: '#0069ee' },
    width: { xs: '100%', sm: 'auto' },
    alignSelf: { xs: 'center', sm: 'auto' }
  }}
  disabled={uploadingAssignment}
>
  {uploadingAssignment ? 'Uploading...' : 'Create Assignment'}
</Button>

   
  
  
</Box>

              </Grid>
              <Grid item xs={12}>
  <Paper
    sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', mb: 2 }}
  >
    <InputBase
      sx={{ ml: 1, flex: 1 }}
      placeholder="Search assignments by name or description"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
    <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
      <SearchIcon />
    </IconButton>
  </Paper>
</Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2, minHeight: 400 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Assignments & Quizzes
                  </Typography>
                  {loadingAssignments ? (
            
                    <CircularProgress sx={{display:'flex', justifyContent:'center', ml:50}}> </CircularProgress>
                  ) : assignments.length === 0 ? (
                    <Typography>No assignments created yet.</Typography>
                  ) : (
                    filteredAssignments.map((assignment) => (
                      <Box
                        key={assignment.id}
                        sx={{
                          p: 2,
                          borderBottom: '1px solid #eee',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#f8fafc' }
                        }}
                        onClick={() => handleAssignmentClick(assignment)}
                      >
                        <Box>
                          <Typography variant="subtitle1">{assignment.name}</Typography>

                          <Typography variant="body2" color="text.secondary">
                            {assignment.subject_name ? assignment.subject_name : "Subject not found"} 
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            {assignment.deadline ? `Deadline: ${new Date(assignment.deadline).toLocaleDateString()}` : "No deadline set"}
                          </Typography> 
                          
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem'}}> 
                            {assignment.file &&  `${assignment.file.name}`}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {assignment.file && (
                            <Tooltip title="Download File">
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(assignment.file);
                                }}
                              >
                                <DownloadIcon sx={{ color:'#05a5d4'}} className='mt-[4px]'/>
                              </IconButton>
                            </Tooltip>
                          )}

                          {/* Only show delete button if assignment doesn't have grades */}
                          {!assignmentsWithGrades.includes(assignment.id) && !assignment.hasGrades && (
                            <Tooltip title="Delete Assignment">
                              <IconButton
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation(); // prevent triggering the parent onClick
                                  openDeleteDialog(assignment);
                                }}
                              >
                                <DeleteIcon/>
                              </IconButton>
                            </Tooltip>
                          )}

                          <Button
                            variant="contained"
                            size="small"
                            sx={{ backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: '#0069ee' }, height: '45px'}}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignmentClick(assignment);
                            }}
                          >
                            Grade
                          </Button>
                        </Box>
                      </Box>
                    ))
                  )}
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6">{selectedAssignment.name}</Typography>
                    <Typography variant="body2">{selectedAssignment.description}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedAssignment.subject}
                      {selectedAssignment.total_marks && (
      <Typography variant="body2" color="text.secondary">
        Total Marks: {selectedAssignment.total_marks}
      </Typography>
    )}
    {selectedAssignment.deadline && (
      <Typography variant="body2" color="text.secondary">
        Deadline: {new Date(selectedAssignment.deadline).toLocaleDateString()}
      </Typography>
    )}
                    </Typography>
                    {selectedAssignment.file && (
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                        <AttachFileIcon fontSize="small" sx={{ mr: 0.5, color: '#4ade80' }} />
                        <Typography variant="body2">{selectedAssignment.file.name}</Typography>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {selectedAssignment.file && (
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownload(selectedAssignment.file)}
                        size="small"
                        sx={{ backgroundColor: '#05a5d4', color:'white', maxHeight: '50px', '&:hover': { backgroundColor: '#04a0d4' } }}
                      >
                        Download
                      </Button>
                    )}
                    <Button variant="outlined" onClick={handleBack} sx={{ maxHeight: '50px'}}>
                      Back to Assignments
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">Student Grades</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedAssignment.description || 'No description provided'}
                  </Typography>
                  {loadingGrades ? (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
    <CircularProgress />
  </Box>
) : (
  <TableContainer component={Paper} sx={{ borderRadius: 2, mt: 3 }}>
    <Table sx={{ minWidth: 650 }}>
      <TableHead>
        <TableRow>
          <TableCell>Roll No</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Marks</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {students.map((student, index) => (
          <TableRow key={student.id}>
            <TableCell>{student.registration_no}</TableCell>
            <TableCell>{student.full_name}</TableCell>
            <TableCell>
              <TextField
                type="number"
                size="small"
                value={student.marks}
                onChange={(e) => handleMarksChange(index, e.target.value)}
                inputProps={{ min: 0 }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)}

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
  variant="contained"
  color="primary"
  onClick={handleMarksSubmit}
  disabled={isSubmittingMarks}
>
  {isSubmittingMarks
    ? "Submitting..."
    : hasExistingGrades
    ? "Update Marks"
    : "Insert Marks"}
</Button>


                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>

       

        {/* Modal */}
       <Modal open={openModal} onClose={handleCloseModal}>
  <Box sx={modalStyle}>
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, position: 'relative' }}>
  <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', flex: 1 }}>
    Create Assignment
  </Typography>
  <IconButton onClick={handleCloseModal} sx={{ position: 'absolute', right: 0 }}>
    <CloseIcon />
  </IconButton>
</Box>

    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <TextField label="Name" name="name" value={formData.name} onChange={handleInputChange} required />
      <FormControl fullWidth margin="normal">
        <InputLabel id="subject-select-label">Subject</InputLabel>
        <Select
          labelId="subject-select-label"
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          label="Subject"
        >
          {classInfo && classInfo.subjects && (
            <MenuItem value={classInfo.subjects.subject_name}>
              {classInfo.subjects.subject_name}
            </MenuItem>
          )}
          {classInfo?.allSubjects?.map((subject, index) => (
            <MenuItem key={index} value={subject.name}>
              {subject.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField label="Description (optional)" name="description" multiline rows={3} value={formData.description} onChange={handleInputChange} />
      <TextField
        label="Total Marks"
        name="total_marks"
        type="number"
        value={formData.total_marks}
        onChange={handleInputChange}
        inputProps={{ min: 1 }}
        required
      />
      <TextField
        label="Deadline"
        name="deadline"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={formData.deadline}
        onChange={handleInputChange}
        inputProps={{ 
    min: 1, // Minimum value of 1
    step: 1 // Only whole numbers
  }}
        required
        fullWidth
      />
      <Box>
        <Typography variant="body2">Attach File (optional)</Typography>
        <input type="file" onChange={handleFileChange} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={handleCloseModal}>Cancel</Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={uploadingAssignment}
          sx={{ backgroundColor: '#4ade80', '&:hover': { backgroundColor: '#22c55e' } }}
        >
          {uploadingAssignment ? 'Uploading...' : 'Create'}
        </Button>
      </Box>
    </form>
  </Box>
</Modal>

        {/* Added Snackbar component from Attendance.jsx */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Delete Assignment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this assignment? 
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button
    onClick={handleDeleteAssignment}
    color="error"
    disabled={isDeleting} // Disable button while deleting
  >
    {isDeleting ? 'Deleting...' : 'Delete'} {/* Show "Deleting..." while in progress */}
  </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Grade;