/* eslint-disable no-unused-vars */
// Updated StudyMaterial.jsx UI consistent with Sidebar and Dashboard - Mobile Responsive
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, InputBase, IconButton, Divider, List,
  ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction, Chip,
  Modal, TextField, Snackbar, Alert, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, useTheme, alpha, useMediaQuery
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import Sidebar from '../Components/Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../../supabase-client';

const StudyMaterial = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', file: null });
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const classInfo = location.state?.classInfo;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getFileIcon = (url) => {
    const ext = url?.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx') return <ArticleIcon sx={{ color: '#00a717' }} />;
    if (ext === 'txt') return <ArticleIcon sx={{ color: '#646969' }} />;
    if (ext === 'pdf') return <PictureAsPdfIcon sx={{ color: '#ff2323' }} />;
    if (['jpg', 'jpeg', 'png','gif'].includes(ext)) return <ImageIcon sx={{ color: '#2196f3' }} />;
    if (['doc', 'docx'].includes(ext)) return <ArticleIcon sx={{ color: '#003291' }} />;
    if (['ppt', 'pptx'].includes(ext)) return <ArticleIcon sx={{ color: '#ff4b16' }} />;
    if (['mp4', 'mov', 'avi','mkv'].includes(ext)) return <VideoFileIcon sx={{ color: '#ff7400' }} />;
    return <ArticleIcon sx={{ color: '#9e9e9e' }} />;
  };

  const fetchResources = async () => {
    setLoadingResources(true);
    try {
      const { data, error } = await supabase
        .from('resource')
        .select('*')
        .eq('teacher_id', classInfo.TeacherID)
        .eq('class_id', classInfo.sections.class_id)
        .eq('section_id', classInfo.section_id)
        // .eq('subject_id', classInfo.subject_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data);
    } catch (err) {
      console.error('Error fetching resources:', err.message);
      setSnackbar({ open: true, message: 'Error loading resources.', severity: 'error' });
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    if (classInfo) {
      fetchResources();
    }
  }, [classInfo]);

  const filteredMaterials = resources.filter(material =>
    material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (material.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    let fileUrl = null;
    const file = formData.file;

    if (file) {
      const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const uniqueFileName = `${uniqueSuffix}-${file.name}`;
      const filePath = `resource/${uniqueFileName}`;

      const { error: uploadError } = await supabase
        .storage
        .from('resource')
        .upload(filePath, file);

      if (uploadError) {
        setSnackbar({ open: true, message: 'File upload failed.', severity: 'error' });
        setUploading(false);
        return;
      }

      const { data } = supabase.storage.from('resource').getPublicUrl(filePath);
      fileUrl = data.publicUrl;
    }

    try {
      const { error } = await supabase.from('resource').insert([{
        teacher_id: classInfo.TeacherID,
        class_id: classInfo.sections.class_id,
        section_id: classInfo.section_id,
        subject_id: classInfo.subject_id,
        name: formData.name,
        description: formData.description,
        file_url: fileUrl
      }]);

      if (error) throw error;
      setSnackbar({ open: true, message: 'Resource uploaded successfully!', severity: 'success' });
      setFormData({ name: '', description: '', file: null });
      setOpenModal(false);
      fetchResources();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setSnackbar({ open: true, message: 'Error uploading resource.', severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.from('resource').delete().eq('id', resourceToDelete.id);
      if (error) throw error;
      setSnackbar({ open: true, message: 'Resource deleted successfully.', severity: 'success' });
      fetchResources();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting resource.', severity: 'error' });
    } finally {
      setDeleting(false);
      setDeleteDialog(false);
      setResourceToDelete(null);
    }
  };

  const openDeleteDialog = (resource) => {
    setResourceToDelete(resource);
    setDeleteDialog(true);
  };

  const modalStyle = {
    position: 'absolute', 
    top: '50%', 
    left: '50%', 
    transform: 'translate(-50%, -50%)',
    width: isMobile ? '90%' : 500, 
    maxWidth: isMobile ? '400px' : '500px',
    bgcolor: 'background.paper', 
    borderRadius: 2, 
    boxShadow: 24, 
    p: isMobile ? 2 : 4,
    maxHeight: '90vh',
    overflowY: 'auto'
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Sidebar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 2, md: 3, lg: 4 }, 
          ml: { xs: 0, md: '240px' }, // No left margin on mobile
          mt: { xs: '64px', md: 0 }, // Add top margin on mobile for app bar
          overflowY: 'auto',
          width: { xs: '100%', md: 'calc(100% - 240px)' }
        }}
      >
        {/* Header Section */}
        <Box sx={{ 
          mb: { xs: 2, md: 4 }, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
            <IconButton 
              onClick={() => navigate(-1)} 
              sx={{ 
                color: theme.palette.primary.main, 
                mr: { xs: 1, sm: 2 }, 
                fontSize: 'medium' 
              }}
            >
              <ArrowBackIcon fontSize="large" />
            </IconButton>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ 
                fontWeight: 700, 
                color: theme.palette.text.primary,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
              }}
            >
              Study Materials
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{
              bgcolor: theme.palette.primary.main,
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 600,
              width: { xs: '100%', sm: 'auto' },
              minWidth: { xs: 'auto', sm: '140px' },
              '&:hover': { bgcolor: theme.palette.primary.dark },
            }}
          >
            Add Material
          </Button>
        </Box>

        {/* Search Section */}
        <Paper
          component="form"
          sx={{ 
            p: { xs: '6px 12px', sm: '8px 16px' }, 
            mb: { xs: 2, md: 3 }, 
            display: 'flex', 
            alignItems: 'center', 
            borderRadius: 2, 
            boxShadow: 1 
          }}
          onSubmit={e => e.preventDefault()}
        >
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}
            placeholder="Search study materials by name or description"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <IconButton 
            type="button" 
            sx={{ 
              p: { xs: '6px', sm: '10px' }, 
              color: theme.palette.primary.main 
            }}
          >
            <SearchIcon />
          </IconButton>
        </Paper>

        {/* Materials List */}
        {loadingResources ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ 
            width: '100%', 
            borderRadius: 2, 
            boxShadow: 1,
            overflow: 'hidden' 
          }}>
            <List sx={{ p: 0 }}>
              {filteredMaterials.map((material, index) => (
                <React.Fragment key={material.id}>
                  <ListItem
  sx={{
    px: { xs: 2, sm: 3 },
    py: { xs: 1.5, sm: 2 },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap', // allows wrapping if too tight
    gap: 2,
  }}
>
  {/* Left: Icon + Text */}
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      minWidth: 0,
      flex: 1,
    }}
  >
    <ListItemIcon sx={{ minWidth: 36 }}>
      {getFileIcon(material.file_url)}
    </ListItemIcon>
    <ListItemText
      primary={material.name}
      secondary={material.description || 'No description'}
      sx={{
        '& .MuiListItemText-primary': {
          fontSize: { xs: '0.9rem', sm: '1rem' },
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        '& .MuiListItemText-secondary': {
          fontSize: { xs: '0.8rem', sm: '0.875rem' },
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      }}
    />
  </Box>

  {/* Right: Chip + Icons */}
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      flexShrink: 0,
    }}
  >
    <Chip
      label={classInfo.subjects.subject_name}
      size="small"
      sx={{
        fontSize: { xs: '0.7rem', sm: '0.75rem' },
        height: { xs: 24, sm: 28 },
      }}
    />
    <IconButton
      size={isMobile ? 'small' : 'medium'}
      onClick={() => window.open(material.file_url, '_blank')}
      sx={{ color: theme.palette.info.main }}
    >
      <DownloadIcon fontSize={isMobile ? 'small' : 'medium'} />
    </IconButton>
    <IconButton
      size={isMobile ? 'small' : 'medium'}
      color="error"
      onClick={() => openDeleteDialog(material)}
    >
      <DeleteIcon fontSize={isMobile ? 'small' : 'medium'} />
    </IconButton>
  </Box>
</ListItem>


                  {index < filteredMaterials.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {filteredMaterials.length === 0 && (
                <ListItem sx={{ py: 4, justifyContent: 'center' }}>
                  <ListItemText 
                    primary="No study materials found." 
                    sx={{ textAlign: 'center' }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        )}

        {/* Upload Modal */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box sx={modalStyle}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: { xs: 2, sm: 3 }
            }}>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                sx={{ fontWeight: 600 }}
              >
                Upload Study Material
              </Typography>
              <IconButton onClick={() => setOpenModal(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <form 
              onSubmit={handleSubmit} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: isMobile ? '12px' : '16px' 
              }}
            >
              <TextField 
                label="Name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
                size={isMobile ? "small" : "medium"}
                fullWidth
              />
              <TextField 
                label="Description" 
                name="description" 
                multiline 
                rows={isMobile ? 2 : 3} 
                value={formData.description} 
                onChange={handleInputChange} 
                size={isMobile ? "small" : "medium"}
                fullWidth
              />
              <Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 1, 
                    fontSize: { xs: '0.8rem', sm: '0.875rem' } 
                  }}
                >
                  Attach File
                </Typography>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  required 
                  style={{ 
                    width: '100%', 
                    padding: isMobile ? '6px' : '8px',
                    fontSize: isMobile ? '0.8rem' : '0.875rem'
                  }}
                />
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: 1, 
                mt: 1,
                flexDirection: { xs: 'column-reverse', sm: 'row' }
              }}>
                <Button 
                  onClick={() => setOpenModal(false)}
                  sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    order: { xs: 2, sm: 1 }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={uploading}
                  sx={{ 
                    bgcolor: theme.palette.primary.main, 
                    width: { xs: '100%', sm: 'auto' },
                    order: { xs: 1, sm: 2 },
                    '&:hover': { bgcolor: theme.palette.primary.dark } 
                  }}
                >
                  {uploading ? <CircularProgress size={24} /> : 'Upload'}
                </Button>
              </Box>
            </form>
          </Box>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteDialog} 
          onClose={() => setDeleteDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { 
              m: { xs: 2, sm: 3 },
              width: { xs: 'calc(100% - 32px)', sm: 'auto' }
            }
          }}
        >
          <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Are you sure you want to delete this resource? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ 
            p: { xs: 2, sm: 3 }, 
            gap: { xs: 1, sm: 0 },
            flexDirection: { xs: 'column-reverse', sm: 'row' }
          }}>
            <Button 
              onClick={() => setDeleteDialog(false)}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              disabled={deleting}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

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
    </Box>
  );
};

export default StudyMaterial;