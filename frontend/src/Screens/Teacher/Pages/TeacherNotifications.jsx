/* eslint-disable no-unused-vars */
// TeacherNotifications.jsx with Monthly filtering
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, CircularProgress, InputBase, IconButton,
  useTheme, alpha, FormControl, Select, MenuItem, InputLabel
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import Sidebar from '../Components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../supabase-client';

const TeacherNotifications = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [teacherData, setTeacherData] = useState(null);
  
  // Generate months array
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Generate years array (current year and previous 3 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Initialize teacher data and set default month/year
  useEffect(() => {
    const initializeTeacherData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) return navigate('/');

        const { data: teacherInfo, error: teacherError } = await supabase
          .from('Teacher')
          .select('TeacherID, SchoolID')
          .eq('user_id', user.id)
          .single();
        if (teacherError) throw teacherError;

        setTeacherData(teacherInfo);

        // Set default to current month and year
        const now = new Date();
        setSelectedMonth(now.getMonth() + 1); // getMonth() returns 0-11
        setSelectedYear(now.getFullYear());
      } catch (err) {
        console.error('Error initializing teacher data:', err);
        setError('Failed to initialize teacher data.');
      }
    };
    initializeTeacherData();
  }, [navigate]);

  // Fetch notifications for specific month and year
  const fetchNotificationsByMonth = useCallback(async (month, year) => {
    if (!teacherData || !month || !year) return;
    
    setLoadingNotices(true);
    setError(null);

    try {
      // Create date range for the selected month
      const startDate = new Date(year, month - 1, 1); // First day of month
      const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month
      
      // Convert to ISO strings for Supabase
      const startDateISO = startDate.toISOString();
      const endDateISO = endDate.toISOString();

      let adminQuery = supabase
        .from('Notice')
        .select('*')
        .eq('AudienceTeacher', true)
        .eq('CreatedType', 'Admin')
        .gte('created_at', startDateISO)
        .lte('created_at', endDateISO)
        .order('Urgent', { ascending: false })
        .order('created_at', { ascending: false });

      let schoolQuery = supabase
        .from('Notice')
        .select('*')
        .eq('AudienceTeacher', true)
        .eq('CreatedType', 'School')
        .eq('CreatedBy', teacherData.SchoolID)
        .gte('created_at', startDateISO)
        .lte('created_at', endDateISO)
        .order('Urgent', { ascending: false })
        .order('created_at', { ascending: false });

      const [adminResult, schoolResult] = await Promise.all([adminQuery, schoolQuery]);

      if (adminResult.error || schoolResult.error) {
        throw adminResult.error || schoolResult.error;
      }

      // Combine and sort notifications
      const allNotices = [...(adminResult.data || []), ...(schoolResult.data || [])];
      const sorted = allNotices.sort((a, b) => {
        if (a.Urgent !== b.Urgent) return b.Urgent ? 1 : -1;
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setNotifications(sorted);
      
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications.');
    } finally {
      setLoadingNotices(false);
    }
  }, [teacherData]);

  // Fetch notifications when month, year changes (but not for search)
  useEffect(() => {
    if (teacherData && selectedMonth && selectedYear && !searchQuery.trim()) {
      fetchNotificationsByMonth(selectedMonth, selectedYear);
    }
  }, [teacherData, selectedMonth, selectedYear, fetchNotificationsByMonth, searchQuery]);

  // Handle search - separate from month filtering
  const handleSearch = useCallback(async (searchTerm) => {
    if (!teacherData) return;
    
    if (searchTerm.trim() === '') {
      // If search is cleared, go back to month-based filtering
      if (selectedMonth && selectedYear) {
        fetchNotificationsByMonth(selectedMonth, selectedYear, '');
      }
      return;
    }

    setLoadingNotices(true);
    setError(null);

    try {
      // Search across ALL notifications, not restricted by month
      let adminQuery = supabase
        .from('Notice')
        .select('*')
        .eq('AudienceTeacher', true)
        .eq('CreatedType', 'Admin')
        .or(`Title.ilike.%${searchTerm}%,Message.ilike.%${searchTerm}%`)
        .order('Urgent', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100); // Reasonable limit for search results

      let schoolQuery = supabase
        .from('Notice')
        .select('*')
        .eq('AudienceTeacher', true)
        .eq('CreatedType', 'School')
        .eq('CreatedBy', teacherData.SchoolID)
        .or(`Title.ilike.%${searchTerm}%,Message.ilike.%${searchTerm}%`)
        .order('Urgent', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100); // Reasonable limit for search results

      const [adminResult, schoolResult] = await Promise.all([adminQuery, schoolQuery]);

      if (adminResult.error || schoolResult.error) {
        throw adminResult.error || schoolResult.error;
      }

      // Combine and sort notifications
      const allNotices = [...(adminResult.data || []), ...(schoolResult.data || [])];
      const sorted = allNotices.sort((a, b) => {
        if (a.Urgent !== b.Urgent) return b.Urgent ? 1 : -1;
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setNotifications(sorted);
      
    } catch (err) {
      console.error('Error searching notifications:', err);
      setError('Failed to search notifications.');
    } finally {
      setLoadingNotices(false);
    }
  }, [teacherData, selectedMonth, selectedYear, fetchNotificationsByMonth]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  // Handle month change
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  // Handle year change
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  // Get month name for display
  const getMonthName = (monthNum) => {
    const month = months.find(m => m.value === monthNum);
    return month ? month.label : '';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Sidebar />
      <Box
  component="main"
  sx={{
    flexGrow: 1,
    p: { xs: 2, sm: 2, md: 3, lg: 4 },
    ml: { xs: 0, md: '240px' },
    mt: { xs: '64px', md: 0 },
    overflowY: 'auto',
  }}
>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}>
          Notifications and Announcements
        </Typography>

        {/* Filter Controls */}
        <Box
  sx={{
    mb: 3,
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    gap: 2,
    flexWrap: 'wrap',
    alignItems: { xs: 'stretch', sm: 'center' }
  }}
>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              label="Month"
              sx={{ bgcolor: 'white' }}
            >
              {months.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 100 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              onChange={handleYearChange}
              label="Year"
              sx={{ bgcolor: 'white' }}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flex: 1, display: 'flex', minWidth: { xs: '100%', sm: 300 } }}>
            <InputBase
              placeholder="Search Notifications"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                flex: 1,
                bgcolor: 'white',
                px: 2,
                py: 1,
                borderRadius: 2,
                boxShadow: 1,
                mr: 1
              }}
            />
            <IconButton sx={{ color: theme.palette.primary.main }}>
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Results Summary */}
        {selectedMonth && selectedYear && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchQuery.trim() ? (
              <>
                Search results for "{searchQuery}" 
                {!loadingNotices && ` (${notifications.length} found across all time)`}
              </>
            ) : (
              <>
                Showing notifications for {getMonthName(selectedMonth)} {selectedYear}
                {!loadingNotices && ` (${notifications.length} found)`}
              </>
            )}
          </Typography>
        )}

        {/* Content */}
        {loadingNotices ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography sx={{ mt: 2, textAlign: 'center' }} color="error">
            {error}
          </Typography>
        ) : notifications.length === 0 ? (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center', bgcolor: 'white' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No notifications found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery.trim() 
                ? `No notifications found matching "${searchQuery}"`
                : `No notifications for ${getMonthName(selectedMonth)} ${selectedYear}`
              }
            </Typography>
          </Paper>
        ) : (
          <Box>
            {notifications.map((notification, index) => (
              <Paper
                key={`${notification.NoticeID}-${index}`}
                elevation={2}
                sx={{
                  p: 2,
                  mb: 2,
                  borderLeft: `6px solid ${
                    notification.CreatedType === 'Admin'
                      ? theme.palette.info.main
                      : theme.palette.secondary.main
                  }`,
                  bgcolor: notification.CreatedType === 'Admin'
                    ? alpha(theme.palette.info.main, 0.08)
                    : alpha(theme.palette.secondary.main, 0.08),
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <NotificationsIcon
                    sx={{
                      color: notification.CreatedType === 'Admin'
                        ? theme.palette.info.main
                        : theme.palette.secondary.main,
                      mr: 2,
                      mt: 0.5
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                      {notification.Title}
                      {notification.Urgent && (
                        <Typography 
                          component="span" 
                          variant="caption" 
                          sx={{ 
                            ml: 1, 
                            px: 1, 
                            py: 0.5, 
                            bgcolor: '#e53935', 
                            color: 'white', 
                            borderRadius: 1,
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}
                        >
                          URGENT
                        </Typography>
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {`${formatDate(notification.StartDate)} - ${formatDate(notification.EndDate)}`}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                      {notification.Message}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        From: {notification.CreatedType}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(notification.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TeacherNotifications;