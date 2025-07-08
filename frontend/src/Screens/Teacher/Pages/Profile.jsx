/* eslint-disable react/no-unescaped-entities */
// Profile.jsx
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress,
  Avatar,
  Divider,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../supabase-client';
import Sidebar from '../Components/Sidebar';
import EditIcon from '@mui/icons-material/Edit';
import { TextField, Button, Snackbar, Alert } from '@mui/material';

const Profile = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
const [newPhoneNumber, setNewPhoneNumber] = useState('');
const [phoneError, setPhoneError] = useState('');
const [isSaving, setIsSaving] = useState(false);

const [snackbar, setSnackbar] = useState({
  open: false,
  message: '',
  severity: 'error'
});

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        setLoading(true);
        
        // Get current authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        if (!user) return navigate('/');

        // Fetch teacher profile data
        const { data, error: profileError } = await supabase
          .from('Teacher')
          .select(`
            Name,
            Email,
            Gender,
            PhoneNumber,
            BPS,
            DateOfBirth,
            CNIC,
            FatherName,
            Domicile,
            Qualification,
            Post,
            TeacherSubject,
            Address,
            HireDate
          `)
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;
        if (!data) throw new Error('Teacher profile not found');

        setTeacherData(data);
      } catch (err) {
        console.error('Error fetching teacher profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherProfile();
  }, [navigate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    const phoneStr = phone.toString();
    return `${phoneStr.slice(0, 4)}-${phoneStr.slice(4)}`;
  };

  const formatCNIC = (cnic) => {
    if (!cnic) return 'N/A';
    const cnicStr = cnic.toString();
    return `${cnicStr.slice(0, 5)}-${cnicStr.slice(5, 12)}-${cnicStr.slice(12)}`;
  };

 const handleSavePhoneNumber = async () => {
  // Validate phone number
  if (!newPhoneNumber || newPhoneNumber.length !== 11 || !/^\d+$/.test(newPhoneNumber)) {
    setPhoneError('Phone number must be exactly 11 digits');
    return;
  }
   setIsSaving(true); // Start saving
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('Teacher')
      .update({ PhoneNumber: newPhoneNumber })
      .eq('user_id', user.id);

    if (error) throw error;

    setTeacherData({ ...teacherData, PhoneNumber: newPhoneNumber });
    setIsEditing(false);
    setPhoneError('');
    setSnackbar({
      open: true,
      message: 'Phone number updated successfully!',
      severity: 'success'
    });
  } catch (err) {
    console.error("Error saving phone number:", err.message);
    setSnackbar({
      open: true,
      message: err.message || 'Failed to update phone number',
      severity: 'error'
    });
  } finally {
    setIsSaving(false); // End saving regardless of success/failure
  }
};
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
    '&::-webkit-scrollbar': {
      width: '0.4em'
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#888'
    }
  }}
>

        <Paper 
          sx={{ 
            p: 4, 
            backgroundColor: '#fff',
            borderRadius: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={30} sx={{ color: theme.palette.primary.main }} />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ p: 2 }}>{error}</Typography>
          ) : teacherData ? (
            <Grid container spacing={4}>
             <Grid 
  item 
  xs={12} 
  md={4} 
  sx={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    textAlign: { xs: 'center', md: 'left' }, 
    mb: { xs: 2, md: 0 } 
  }}
>

                <Avatar 
                  sx={{ 
                    width: 150, 
                    height: 150, 
                    fontSize: 60,
                    backgroundColor: theme.palette.primary.main,
                    mb: 2
                  }}
                >
                  {teacherData.Name ? teacherData.Name.charAt(0).toUpperCase() : 'T'}
                </Avatar>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {teacherData.Name || 'N/A'}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {teacherData.Post || 'Teacher'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, color: theme.palette.primary.main }}>
                  Personal Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{teacherData.Email || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Gender</Typography>
                    <Typography variant="body1">{teacherData.Gender || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Phone Number</Typography>
                     {isEditing ? (
    <>
      <TextField
  value={newPhoneNumber}
  onChange={(e) => {
    setNewPhoneNumber(e.target.value);
    // Clear error when user types
    if (phoneError) setPhoneError('');
  }}
  variant="outlined"
  size="small"
  fullWidth
  sx={{ mt: 1 }}
  error={!!phoneError}
  helperText={phoneError}
  inputProps={{
    maxLength: 11,
    inputMode: 'numeric',
    pattern: '[0-9]*'
  }}
  InputProps={{
    style: {
      borderColor: phoneError ? theme.palette.error.main : theme.palette.primary.main,
      borderWidth: '2px'
    }
  }}
/>
      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
      <Button
  onClick={handleSavePhoneNumber}
  variant="contained"
  size="small"
  color="primary"
  disabled={!newPhoneNumber || newPhoneNumber.length !== 11 || !!phoneError || isSaving}
>
  {isSaving ? (
    <>
      <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
      Saving...
    </>
  ) : (
    'Save'
  )}
</Button>
        <Button
          onClick={() => setIsEditing(false)}
          variant="outlined"
          size="small"
          color="secondary"
        >
          Cancel
        </Button>
      </Box>
    </>
  ) : (
    <>
      <Typography variant="body1">{formatPhoneNumber(teacherData.PhoneNumber)}</Typography>
      <Button
        onClick={() => {
          setNewPhoneNumber(teacherData.PhoneNumber);
          setIsEditing(true);
        }}
        startIcon={<EditIcon />}
        size="small"
        sx={{ mt: 1 }}
      >
        Edit
      </Button>
    </>
  )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">BPS</Typography>
                    <Typography variant="body1">{teacherData.BPS || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Date of Birth</Typography>
                    <Typography variant="body1">{formatDate(teacherData.DateOfBirth)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">CNIC</Typography>
                    <Typography variant="body1">{formatCNIC(teacherData.CNIC)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Father's Name</Typography>
                    <Typography variant="body1">{teacherData.FatherName || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Domicile</Typography>
                    <Typography variant="body1">{teacherData.Domicile || 'N/A'}</Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom sx={{ mb: 2, color: theme.palette.primary.main }}>
                  Professional Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Qualification</Typography>
                    <Typography variant="body1">{teacherData.Qualification || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
                    <Typography variant="body1">{teacherData.TeacherSubject || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                    <Typography variant="body1">{teacherData.Address || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Hire Date</Typography>
                    <Typography variant="body1">{formatDate(teacherData.HireDate)}</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Typography sx={{ p: 2 }}>No profile data found.</Typography>
          )}
        </Paper>
      </Box>
      <Snackbar
  open={snackbar.open}
  autoHideDuration={6000}
  onClose={() => setSnackbar({...snackbar, open: false})}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert 
    onClose={() => setSnackbar({...snackbar, open: false})}
    severity={snackbar.severity}
    sx={{ width: '100%' }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>
    </Box>
  );
};

export default Profile;