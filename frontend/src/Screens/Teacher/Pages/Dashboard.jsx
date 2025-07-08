/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
// Updated Dashboard.jsx with mobile responsiveness
import React, { useState, useEffect } from "react"
import { Box, Typography, Paper, Grid, Button, CircularProgress, Chip, useTheme, alpha, useMediaQuery } from "@mui/material"
import NotificationsIcon from "@mui/icons-material/Notifications"
import Sidebar from "../Components/Sidebar"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../../../supabase-client"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker'
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"
import DownloadIcon from "@mui/icons-material/Download"
import ClassIcon from "@mui/icons-material/Class"
import EventIcon from "@mui/icons-material/Event"
import AnnouncementIcon from "@mui/icons-material/Announcement"
import ScheduleIcon from "@mui/icons-material/Schedule"

const Dashboard = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))
  
  const [assignedClasses, setAssignedClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loadingNotices, setLoadingNotices] = useState(true)

  const [timetableFilePath, setTimetableFilePath] = useState(null)
  const [timetableFileName, setTimetableFileName] = useState("")
  const [timetableLoading, setTimetableLoading] = useState(true)

  const [calendarValue, setCalendarValue] = useState(new Date())

  useEffect(() => {
    const fetchTimetableFile = async () => {
      try {
        setTimetableLoading(true)
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) return navigate("/")

        const { data: teacherData, error: teacherError } = await supabase
          .from("Teacher")
          .select("SchoolID")
          .eq("user_id", user.id)
          .single()
        if (teacherError) throw teacherError

        const { data: timetableData, error: timetableError } = await supabase
          .from("faculty_timetables")
          .select("file_path, file_name")
          .eq("school_id", teacherData.SchoolID)
          .single()
        if (timetableError) throw timetableError

        const filePath = timetableData?.file_path
        const fileName = timetableData?.file_name

        if (!filePath) return

        const { data: urlData } = supabase.storage.from("faculty-timetables").getPublicUrl(filePath)

        setTimetableFilePath(urlData?.publicUrl || null)
        setTimetableFileName(fileName || "")
      } catch (err) {
        console.error("Error fetching timetable file:", err)
      } finally {
        setTimetableLoading(false)
      }
    }

    fetchTimetableFile()
  }, [navigate])

  useEffect(() => {
    const fetchNotificationData = async () => {
      setLoadingNotices(true)
      try {
        setLoading(true)

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) return navigate("/")

        const { data: teacherData, error: teacherError } = await supabase
          .from("Teacher")
          .select("TeacherID, SchoolID")
          .eq("user_id", user.id)
          .single()
        if (teacherError) throw teacherError

        const today = new Date().toISOString().split("T")[0]

        const { data: adminNotices, error: adminError } = await supabase
          .from("Notice")
          .select("*")
          .eq("AudienceTeacher", true)
          .eq("CreatedType", "Admin")
          .eq("Status", "ON")
          .gte("EndDate", today)

        const { data: schoolNotices, error: schoolError } = await supabase
          .from("Notice")
          .select("*")
          .eq("AudienceTeacher", true)
          .eq("CreatedType", "School")
          .eq("CreatedBy", teacherData.SchoolID)
          .eq("Status", "ON")
          .gte("EndDate", today)

        if (adminError || schoolError) throw adminError || schoolError

        const allNotices = [...(adminNotices || []), ...(schoolNotices || [])]
        const sorted = allNotices.sort((a, b) => {
          if (a.Urgent === b.Urgent) {
            return new Date(b.created_at) - new Date(a.created_at)
          }
          return b.Urgent ? 1 : -1
        })

        setNotifications(sorted)
      } catch (err) {
        console.error("Dashboard load error:", err)
        setError("Failed to load dashboard data.")
      } finally {
        setLoadingNotices(false)
      }
    }

    fetchNotificationData()
  }, [navigate])

  useEffect(() => {
    const fetchAssignedClasses = async () => {
      try {
        setLoading(true)

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) throw userError

        if (!user) {
          navigate("/")
          return
        }

        const { data: teacherData, error: teacherError } = await supabase
          .from("Teacher")
          .select("TeacherID")
          .eq("user_id", user.id)
          .single()

        if (teacherError) throw teacherError

        if (!teacherData) {
          setError("Teacher profile not found")
          setLoading(false)
          return
        }

        const { data: assignments, error: assignmentError } = await supabase
          .from("teacher_assignments")
          .select(`
            TeacherID,
            assignment_id,
            section_id,
            subjects,
            sections:section_id (
              section_name,
              class_id,
              classes:class_id (class_name)
            )
          `)
          .eq("TeacherID", teacherData.TeacherID)

        if (assignmentError) throw assignmentError

        const allSubjectIds = assignments.flatMap((a) => (a.subjects || []).map((sub) => sub))

        const uniqueSubjectIds = [...new Set(allSubjectIds)]

        const { data: subjectDetails, error: subjectError } = await supabase
          .from("subjects")
          .select("subject_id, subject_name")
          .in("subject_id", uniqueSubjectIds)

        if (subjectError) throw subjectError

        const subjectMap = {}
        ;(subjectDetails || []).forEach((sub) => {
          subjectMap[sub.subject_id] = sub.subject_name
        })

        const formattedClasses = assignments.map((a) => {
          const subjectList = (a.subjects || []).map((id) => ({
            id,
            name: subjectMap[id] || "Unknown Subject",
            rawData: a,
          }))

          return {
            className: a.sections?.classes?.class_name || "Unknown Class",
            classID: a.sections?.class_id || null,
            section: a.sections?.section_name || "Unknown Section",
            subjects: subjectList,
            displaySubjects: subjectList.map((s) => s.name).join(", "),
            day: "—",
            time: "—",
            rawData: a,
          }
        })

        setAssignedClasses(formattedClasses)
      } catch (err) {
        console.error("Error fetching assigned classes:", err)
        setError("Failed to load assigned classes")
      } finally {
        setLoading(false)
      }
    }

    fetchAssignedClasses()
  }, [navigate])

  const handleManageClick = (classInfo) => {
    if (classInfo.subjects && classInfo.subjects.length > 0) {
      const baseData = classInfo.subjects[0].rawData
      const enhancedData = {
        ...baseData,
        allSubjects: classInfo.subjects.map((subj) => ({
          name: subj.name,
          rawData: subj.rawData,
        })),
      }
      navigate("/teacher/class-management", { state: { classInfo: enhancedData } })
    } else {
      navigate("/teacher/class-management", { state: { classInfo: classInfo.rawData } })
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Professional card component with mobile responsiveness
  const DashboardCard = ({ title, icon, children, height = 400 }) => (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        height: { xs: 'auto', md: height },
        minHeight: { xs: 300, md: height },
        display: "flex",
        flexDirection: "column",
        background: "white",
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        transition: "all 0.3s ease",
        overflow: "hidden",
        "&:hover": {
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.dark, 0.12)}`,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: { xs: 36, sm: 42 },
            height: { xs: 36, sm: 42 },
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            mr: 2,
          }}
        >
          {React.cloneElement(icon, { 
            sx: { 
              color: theme.palette.primary.main, 
              fontSize: { xs: 18, sm: 22 } 
            } 
          })}
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 600,
            fontSize: { xs: "1rem", sm: "1.1rem" },
          }}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  )

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: '#f0f2f5' }}>
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3, lg: 4 },
          ml: { xs: 0, md: "240px" },
          mt: { xs: '64px', md: 0 }, // ✅ Add margin-top for mobile to avoid AppBar overlap
          minHeight: "100vh",
          width: { xs: '100%', md: 'calc(100% - 240px)' },
        }}
      >
        {/* Header with gradient underline */}
        <Box sx={{ 
          mb: { xs: 2, sm: 3, md: 4 }, 
          pb: 2, 
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` 
        }}>
          <Typography
            variant="h4"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.2rem" },
            }}
          >
            Teacher Dashboard
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Welcome back! Here's what's happening in your classes today.
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Class Timetable */}
          <Grid item xs={12} lg={6}>
            <DashboardCard title="Class Timetable" icon={<ScheduleIcon />}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {timetableLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={30} sx={{ color: theme.palette.primary.main }} />
                  </Box>
                ) : timetableFilePath ? (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 1.5, sm: 2 },
                    flexDirection: { xs: 'column', sm: 'row' }
                  }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: { xs: 40, sm: 48 },
                        height: { xs: 40, sm: 48 },
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        flexShrink: 0,
                      }}
                    >
                      <InsertDriveFileIcon sx={{ 
                        color: theme.palette.error.main, 
                        fontSize: { xs: 20, sm: 24 } 
                      }} />
                    </Box>
                    <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 600, 
                          color: theme.palette.text.primary,
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                      >
                        {timetableFileName}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        Class schedule document
                      </Typography>
                    </Box>
                    <Button
                      component="a"
                      href={timetableFilePath}
                      download={timetableFileName}
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        color: "white",
                        borderRadius: 1.5,
                        textTransform: "none",
                        fontWeight: 600,
                        px: { xs: 2, sm: 3 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        "&:hover": {
                          bgcolor: theme.palette.primary.dark,
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      Download
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", px: 2 }}>
                    <ScheduleIcon sx={{ 
                      fontSize: { xs: 40, sm: 48 }, 
                      color: alpha(theme.palette.text.primary, 0.2), 
                      mb: 2 
                    }} />
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      No timetable file available for this school.
                    </Typography>
                  </Box>
                )}
              </Box>
            </DashboardCard>
          </Grid>

          {/* Calendar */}
          <Grid item xs={12} lg={6}>
            <DashboardCard title="Calendar" icon={<EventIcon />}>
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  px: { xs: 0, sm: 1 },
                  "& .MuiPickersLayout-root": {
                    borderRadius: 2,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                    bgcolor: "white",
                  },
                  "& .MuiDateCalendar-root": {
                    width: "100%",
                    maxWidth: { xs: "100%", sm: "320px" },
                  },
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <StaticDatePicker
                    displayStaticWrapperAs="desktop"
                    value={calendarValue}
                    onChange={(newValue) => setCalendarValue(newValue)}
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
              </Box>
            </DashboardCard>
          </Grid>

          {/* Notifications */}
          <Grid item xs={12} lg={6}>
            <DashboardCard title="Notifications & Announcements" icon={<AnnouncementIcon />}>
              <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                {loadingNotices ? (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <CircularProgress size={30} sx={{ color: theme.palette.primary.main }} />
                  </Box>
                ) : notifications.length === 0 ? (
                  <Box sx={{ textAlign: "center", mt: 4 }}>
                    <NotificationsIcon sx={{ 
                      fontSize: { xs: 40, sm: 48 }, 
                      color: alpha(theme.palette.text.primary, 0.2), 
                      mb: 2 
                    }} />
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      No notifications found.
                    </Typography>
                  </Box>
                ) : (
                  notifications.map((notification, index) => (
                    <Paper
                      key={index}
                      elevation={1}
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        mb: 2,
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        background:
                          notification.CreatedType === "Admin"
                            ? alpha(theme.palette.info.main, 0.08)
                            : alpha(theme.palette.secondary.main, 0.08),
                        borderLeft: `4px solid ${
                          notification.CreatedType === "Admin"
                            ? theme.palette.info.main
                            : theme.palette.secondary.main
                        }`,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "translateX(4px)",
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                        },
                        display: "flex",
                        gap: { xs: 1, sm: 2 },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: { xs: 32, sm: 36 },
                          height: { xs: 32, sm: 36 },
                          borderRadius: 1.5,
                          bgcolor:
                            notification.CreatedType === "Admin"
                              ? theme.palette.info.main
                              : theme.palette.secondary.main,
                          flexShrink: 0,
                        }}
                      >
                        <NotificationsIcon sx={{ 
                          color: "white", 
                          fontSize: { xs: 16, sm: 18 } 
                        }} />
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 600, 
                              color: theme.palette.text.primary,
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            {notification.Title}
                          </Typography>
                          {notification.Urgent && (
                            <Chip
                              label="Urgent"
                              size="small"
                              sx={{
                                bgcolor: theme.palette.error.main,
                                color: "white",
                                fontSize: { xs: "8px", sm: "10px" },
                                height: { xs: 18, sm: 20 },
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ 
                            color: theme.palette.text.secondary, 
                            display: "block", 
                            mb: 1,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}
                        >
                          {`${formatDate(notification.StartDate)} - ${formatDate(notification.EndDate)}`}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ 
                            color: theme.palette.text.secondary, 
                            lineHeight: 1.5, 
                            mb: 1,
                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                          }}
                        >
                          {notification.Message}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: alpha(theme.palette.text.primary, 0.6),
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }
                          }}
                        >
                          From: {notification.CreatedType}
                        </Typography>
                      </Box>
                    </Paper>
                  ))
                )}
              </Box>
            </DashboardCard>
          </Grid>

          {/* Assigned Classes */}
          <Grid item xs={12} lg={6}>
            <DashboardCard title="Assigned Classes" icon={<ClassIcon />}>
              <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                    <CircularProgress size={30} sx={{ color: theme.palette.primary.main }} />
                  </Box>
                ) : error ? (
                  <Typography 
                    color="error" 
                    sx={{ 
                      p: 2, 
                      textAlign: "center",
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    {error}
                  </Typography>
                ) : assignedClasses.length === 0 ? (
                  <Box sx={{ textAlign: "center", mt: 4 }}>
                    <ClassIcon sx={{ 
                      fontSize: { xs: 40, sm: 48 }, 
                      color: alpha(theme.palette.text.primary, 0.2), 
                      mb: 2 
                    }} />
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      No classes assigned yet.
                    </Typography>
                  </Box>
                ) : (
                  assignedClasses.map((class_, index) => (
                    <Paper
                      key={index}
                      elevation={1}
                      sx={{
                        p: { xs: 1.5, sm: 2.5 },
                        mb: 2,
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.2s ease",
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1.5, sm: 0 },
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
                        },
                      }}
                    >
                      <Box sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 2,
                        width: { xs: '100%', sm: 'auto' }
                      }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: { xs: 32, sm: 36 },
                            height: { xs: 32, sm: 36 },
                            borderRadius: 1.5,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            flexShrink: 0,
                          }}
                        >
                          <ClassIcon sx={{ 
                            color: theme.palette.primary.main, 
                            fontSize: { xs: 16, sm: 18 } 
                          }} />
                        </Box>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 600, 
                              color: theme.palette.text.primary,
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            {class_.className} - {class_.section}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              wordBreak: 'break-word'
                            }}
                          >
                            {class_.displaySubjects || class_.subject}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleManageClick(class_)}
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          color: "white",
                          borderRadius: 1.5,
                          textTransform: "none",
                          fontWeight: 600,
                          px: { xs: 2, sm: 2.5 },
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          width: { xs: '100%', sm: 'auto' },
                          "&:hover": {
                            bgcolor: theme.palette.primary.dark,
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        Manage
                      </Button>
                    </Paper>
                  ))
                )}
              </Box>
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default Dashboard