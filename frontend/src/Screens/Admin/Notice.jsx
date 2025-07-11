// // import React, { useState, useEffect } from "react";
// // import {
// //   Box,
// //   Button,
// //   TextField,
// //   Typography,
// //   Card,
// //   CardContent,
// //   FormControl,
// //   InputLabel,
// //   MenuItem,
// //   Select,
// //   Switch,
// //   FormControlLabel,
// //   Snackbar,
// //   Alert,
// //   Checkbox,
// //   FormGroup,
// //   FormLabel,
// // } from "@mui/material";
// // import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// // import AddIcon from "@mui/icons-material/Add";
// // import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
// // import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// // import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// // import { useNavigate } from "react-router-dom";
// // import { useFormik } from "formik";
// // import * as Yup from "yup";
// // import supabase from "../../../supabase-client";

// // const AddNotice = () => {
// //   const [alert, setAlert] = useState({
// //     open: false,
// //     message: "",
// //     severity: "",
// //   });
// //   const [userEmail, setUserEmail] = useState("");
// //   const [adminId, setAdminId] = useState(null);
// //   const navigate = useNavigate();

// //   // Validation Schema
// //   const validationSchema = Yup.object().shape({
// //     Title: Yup.string()
// //       .required("Title is required")
// //       .matches(/^[a-zA-Z\s]*$/, "Title can only contain letters and spaces"),
// //     Message: Yup.string().required("Message is required"),
// //     Type: Yup.string().required("Type is required"),
// //     SubType: Yup.string().required("Sub-type is required"),
// //     StartDate: Yup.date().required("Start date is required"),
// //     EndDate: Yup.date()
// //       .required("End date is required")
// //       .min(Yup.ref("StartDate"), "End date must be after start date"),
// //   });

// //   // Get current user and admin ID on component mount
// //   useEffect(() => {
// //     const fetchUserAndAdminId = async () => {
// //       // Get authenticated user
// //       const {
// //         data: { user },
// //         error: authError,
// //       } = await supabase.auth.getUser();

// //       if (authError) {
// //         navigate("/login");
// //         return;
// //       }

// //       if (user) {
// //         setUserEmail(user.email);

// //         // Fetch admin ID from Admin table using the email
// //         const { data: adminData, error: adminError } = await supabase
// //           .from("Admin")
// //           .select("AdminID")
// //           .eq("Email", user.email)
// //           .single();

// //         if (adminError) {
// //           console.error("Error fetching admin ID:", adminError);
// //           setAlert({
// //             open: true,
// //             message: "Failed to verify admin privileges",
// //             severity: "error",
// //           });
// //           return;
// //         }

// //         if (adminData) {
// //           setAdminId(adminData.AdminID);
// //         } else {
// //           setAlert({
// //             open: true,
// //             message: "Only admins can create notices",
// //             severity: "error",
// //           });
// //           navigate(-1); // Go back if not an admin
// //         }
// //       }
// //     };

// //     fetchUserAndAdminId();
// //   }, [navigate]);

// //   // Formik initialization
// //   const formik = useFormik({
// //     initialValues: {
// //       NoticeID: "",
// //       Title: "",
// //       Message: "",
// //       StartDate: null,
// //       EndDate: null,
// //       Type: "Government",
// //       SubType: "Holiday",
// //       CreatedBy: null, // Will be set to AdminID
// //       AudienceSchool: false,
// //       AudienceTeacher: false,
// //       AudienceStudent: false,
// //       Urgent: false,
// //     },
// //     validationSchema,
// //     onSubmit: async (values) => {
// //       try {
// //         if (!values.NoticeID) {
// //           await generateNoticeID(values.Type, values.SubType);
// //         }

// //         const payload = {
// //           NoticeID: values.NoticeID,
// //           Title: values.Title,
// //           Message: values.Message,
// //           Type: values.Type,
// //           SubType: values.SubType,
// //           CreatedBy: adminId, // Use the fetched AdminID
// //           CreatedType: "Admin",
// //           AudienceSchool: values.AudienceSchool,
// //           AudienceTeacher: values.AudienceTeacher,
// //           AudienceStudent: values.AudienceStudent,
// //           Urgent: values.Urgent,
// //           StartDate: values.StartDate
// //             ? new Date(values.StartDate).toISOString()
// //             : null,
// //           EndDate: values.EndDate
// //             ? new Date(values.EndDate).toISOString()
// //             : null,
// //         };

// //         const { data, error } = await supabase
// //           .from("Notice")
// //           .insert([payload])
// //           .select();

// //         if (error) throw error;

// //         setAlert({
// //           open: true,
// //           message: "Notice posted successfully!",
// //           severity: "success",
// //         });

// //         formik.resetForm({
// //           values: {
// //             ...formik.initialValues,
// //             CreatedBy: adminId,
// //           },
// //         });

// //         generateNoticeID(formik.values.Type, formik.values.SubType);
// //       } catch (error) {
// //         setAlert({
// //           open: true,
// //           message: error.message || "Failed to post notice. Try again!",
// //           severity: "error",
// //         });
// //       }
// //     },
// //   });

// //   // Update form values when adminId changes
// //   useEffect(() => {
// //     if (adminId) {
// //       formik.setFieldValue("CreatedBy", adminId);
// //     }
// //   }, [adminId]);

// //   const generateNoticeID = async (type, subType) => {
// //     const today = new Date();
// //     const year = today.getFullYear();
// //     const month = String(today.getMonth() + 1).padStart(2, "0");
// //     const day = String(today.getDate()).padStart(2, "0");

// //     const typeInitial = type.charAt(0);
// //     const subTypeInitial = subType.charAt(0);

// //     try {
// //       const { data, error } = await supabase
// //         .from("Notice")
// //         .select("NoticeID")
// //         .like(
// //           "NoticeID",
// //           `N-${typeInitial}-${subTypeInitial}-${year}${month}${day}-%`
// //         );

// //       if (error) throw error;

// //       let nextSerial = 1;
// //       if (data && data.length > 0) {
// //         const latestNotice = data[data.length - 1].NoticeID;
// //         const latestSerial = parseInt(latestNotice.split("-")[4]) || 0;
// //         nextSerial = latestSerial + 1;
// //       }

// //       const newNoticeID = `N-${typeInitial}-${subTypeInitial}-${year}${month}${day}-${nextSerial}`;
// //       formik.setFieldValue("NoticeID", newNoticeID);
// //     } catch (error) {
// //       console.error("Error fetching notice IDs:", error);
// //       const newNoticeID = `N-${typeInitial}-${subTypeInitial}-${year}${month}${day}-1`;
// //       formik.setFieldValue("NoticeID", newNoticeID);
// //     }
// //   };

// //   useEffect(() => {
// //     if (formik.values.Type && formik.values.SubType) {
// //       generateNoticeID(formik.values.Type, formik.values.SubType);
// //     }
// //   }, [formik.values.Type, formik.values.SubType]);

// //   const handleDateRangeChange = (newValue) => {
// //     formik.setFieldValue("StartDate", newValue[0]);
// //     formik.setFieldValue("EndDate", newValue[1]);
// //   };

// //   const handleAudienceChange = (name) => (event) => {
// //     const checked = event.target.checked;

// //     if (name === "AudienceStudent") {
// //       formik.setValues({
// //         ...formik.values,
// //         AudienceStudent: checked,
// //         AudienceTeacher: checked,
// //         AudienceSchool: checked,
// //       });
// //     } else if (name === "AudienceTeacher") {
// //       formik.setValues({
// //         ...formik.values,
// //         AudienceTeacher: checked,
// //         AudienceSchool: checked,
// //         AudienceStudent: false,
// //       });
// //     } else if (name === "AudienceSchool") {
// //       formik.setValues({
// //         ...formik.values,
// //         AudienceSchool: checked,
// //         AudienceTeacher: checked ? formik.values.AudienceTeacher : false,
// //         AudienceStudent: false,
// //       });
// //     }
// //   };

// //   const handleGoBack = () => navigate(-1);
// //   const handleCloseAlert = () => setAlert({ ...alert, open: false });

// //   return (
// //     <LocalizationProvider dateAdapter={AdapterDateFns}>
// //       <Box
// //         display="flex"
// //         justifyContent="center"
// //         alignItems="center"
// //         bgcolor="#f5f5f5"
// //         p={4}
// //       >
// //         <Card
// //           sx={{
// //             maxWidth: 500,
// //             padding: 3,
// //             textAlign: "center",
// //             width: "100%",
// //           }}
// //         >
// //           <CardContent>
// //             <Typography variant="h5" fontWeight="bold" mb={2}>
// //               Add a Notice
// //             </Typography>

// //             <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic" }}>
// //               Notice will be created by Admin ID: {adminId || "Loading..."}
// //             </Typography>

// //             <form onSubmit={formik.handleSubmit}>
// //               <Box display="flex" gap={2} mb={2}>
// //                 <FormControl fullWidth>
// //                   <InputLabel>Type</InputLabel>
// //                   <Select
// //                     value={formik.values.Type}
// //                     name="Type"
// //                     onChange={formik.handleChange}
// //                     onBlur={formik.handleBlur}
// //                     error={formik.touched.Type && Boolean(formik.errors.Type)}
// //                   >
// //                     <MenuItem value="Government">Government</MenuItem>
// //                     <MenuItem value="School">School</MenuItem>
// //                   </Select>
// //                 </FormControl>

// //                 <FormControl fullWidth>
// //                   <InputLabel>Sub-Type</InputLabel>
// //                   <Select
// //                     value={formik.values.SubType}
// //                     name="SubType"
// //                     onChange={formik.handleChange}
// //                     onBlur={formik.handleBlur}
// //                     error={
// //                       formik.touched.SubType && Boolean(formik.errors.SubType)
// //                     }
// //                   >
// //                     <MenuItem value="Holiday">Holiday</MenuItem>
// //                     <MenuItem value="Event">Event</MenuItem>
// //                   </Select>
// //                 </FormControl>
// //               </Box>

// //               <TextField
// //                 fullWidth
// //                 label="Title *"
// //                 variant="outlined"
// //                 value={formik.values.Title}
// //                 name="Title"
// //                 onChange={formik.handleChange}
// //                 onBlur={formik.handleBlur}
// //                 error={formik.touched.Title && Boolean(formik.errors.Title)}
// //                 helperText={formik.touched.Title && formik.errors.Title}
// //                 margin="normal"
// //               />

// //               <TextField
// //                 fullWidth
// //                 label="Message *"
// //                 variant="outlined"
// //                 multiline
// //                 rows={4}
// //                 value={formik.values.Message}
// //                 name="Message"
// //                 onChange={formik.handleChange}
// //                 onBlur={formik.handleBlur}
// //                 error={formik.touched.Message && Boolean(formik.errors.Message)}
// //                 helperText={formik.touched.Message && formik.errors.Message}
// //                 margin="normal"
// //               />

// //               <Box mt={2} mb={2}>
// //                 <FormLabel component="legend">Audience</FormLabel>
// //                 <FormGroup row>
// //                   <FormControlLabel
// //                     control={
// //                       <Checkbox
// //                         checked={formik.values.AudienceSchool}
// //                         onChange={handleAudienceChange("AudienceSchool")}
// //                         name="AudienceSchool"
// //                       />
// //                     }
// //                     label="School"
// //                   />
// //                   <FormControlLabel
// //                     control={
// //                       <Checkbox
// //                         checked={formik.values.AudienceTeacher}
// //                         onChange={handleAudienceChange("AudienceTeacher")}
// //                         name="AudienceTeacher"
// //                         disabled={!formik.values.AudienceSchool}
// //                       />
// //                     }
// //                     label="Teacher"
// //                   />
// //                   <FormControlLabel
// //                     control={
// //                       <Checkbox
// //                         checked={formik.values.AudienceStudent}
// //                         onChange={handleAudienceChange("AudienceStudent")}
// //                         name="AudienceStudent"
// //                         disabled={!formik.values.AudienceTeacher}
// //                       />
// //                     }
// //                     label="Student"
// //                   />
// //                 </FormGroup>
// //               </Box>

// //               <FormControlLabel
// //                 control={
// //                   <Switch
// //                     checked={formik.values.Urgent}
// //                     onChange={formik.handleChange}
// //                     name="Urgent"
// //                   />
// //                 }
// //                 label="Mark as Urgent"
// //                 sx={{ mb: 2 }}
// //               />

// //               <DateRangePicker
// //                 startText="Start Date *"
// //                 endText="End Date *"
// //                 value={[formik.values.StartDate, formik.values.EndDate]}
// //                 onChange={handleDateRangeChange}
// //                 renderInput={(startProps, endProps) => (
// //                   <>
// //                     <TextField
// //                       {...startProps}
// //                       fullWidth
// //                       margin="normal"
// //                       error={
// //                         formik.touched.StartDate &&
// //                         Boolean(formik.errors.StartDate)
// //                       }
// //                       helperText={
// //                         formik.touched.StartDate && formik.errors.StartDate
// //                       }
// //                     />
// //                     <Box sx={{ mx: 2 }}> to </Box>
// //                     <TextField
// //                       {...endProps}
// //                       fullWidth
// //                       margin="normal"
// //                       error={
// //                         formik.touched.EndDate && Boolean(formik.errors.EndDate)
// //                       }
// //                       helperText={
// //                         formik.touched.EndDate && formik.errors.EndDate
// //                       }
// //                     />
// //                   </>
// //                 )}
// //               />

// //               <Box mt={3} display="flex" justifyContent="center">
// //                 <Button
// //                   variant="contained"
// //                   color="primary"
// //                   startIcon={<AddIcon />}
// //                   type="submit"
// //                   disabled={!formik.isValid || formik.isSubmitting}
// //                 >
// //                   Post Notice
// //                 </Button>
// //               </Box>
// //             </form>
// //           </CardContent>
// //         </Card>

// //         <Snackbar
// //           open={alert.open}
// //           autoHideDuration={6000}
// //           onClose={handleCloseAlert}
// //         >
// //           <Alert onClose={handleCloseAlert} severity={alert.severity}>
// //             {alert.message}
// //           </Alert>
// //         </Snackbar>
// //       </Box>
// //     </LocalizationProvider>
// //   );
// // };

// // export default AddNotice;

// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Button,
//   TextField,
//   Typography,
//   Card,
//   CardContent,
//   FormControl,
//   InputLabel,
//   MenuItem,
//   Select,
//   Switch,
//   FormControlLabel,
//   Snackbar,
//   Alert,
//   Checkbox,
//   FormGroup,
//   FormLabel,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   CircularProgress,
// } from "@mui/material";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import AddIcon from "@mui/icons-material/Add";
// import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { useNavigate } from "react-router-dom";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import supabase from "../../../supabase-client";

// const AddNotice = () => {
//   const [alert, setAlert] = useState({
//     open: false,
//     message: "",
//     severity: "",
//   });
//   const [userEmail, setUserEmail] = useState("");
//   const [adminId, setAdminId] = useState(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [isPosting, setIsPosting] = useState(false);
//   const navigate = useNavigate();

//   // Validation Schema
//   const validationSchema = Yup.object().shape({
//     Title: Yup.string()
//       .required("Title is required")
//       .matches(/^[a-zA-Z\s]*$/, "Title can only contain letters and spaces"),
//     Message: Yup.string().required("Message is required"),
//     Type: Yup.string().required("Type is required"),
//     SubType: Yup.string().required("Sub-type is required"),
//     StartDate: Yup.date().required("Start date is required"),
//     EndDate: Yup.date()
//       .required("End date is required")
//       .min(Yup.ref("StartDate"), "End date must be after start date"),
//   });

//   // Get current user and admin ID
//   useEffect(() => {
//     const fetchUserAndAdminId = async () => {
//       const {
//         data: { user },
//         error: authError,
//       } = await supabase.auth.getUser();

//       if (authError) {
//         navigate("/login");
//         return;
//       }

//       if (user) {
//         setUserEmail(user.email);

//         const { data: adminData, error: adminError } = await supabase
//           .from("Admin")
//           .select("AdminID")
//           .eq("Email", user.email)
//           .single();

//         if (adminError) {
//           console.error("Error fetching admin ID:", adminError);
//           setAlert({
//             open: true,
//             message: "Failed to verify admin privileges",
//             severity: "error",
//           });
//           return;
//         }

//         if (adminData) {
//           setAdminId(adminData.AdminID);
//         } else {
//           setAlert({
//             open: true,
//             message: "Only admins can create notices",
//             severity: "error",
//           });
//           navigate(-1);
//         }
//       }
//     };

//     fetchUserAndAdminId();
//   }, [navigate]);

//   // Formik initialization
//   const formik = useFormik({
//     initialValues: {
//       NoticeID: "",
//       Title: "",
//       Message: "",
//       StartDate: null,
//       EndDate: null,
//       Type: "Government",
//       SubType: "Holiday",
//       CreatedBy: null,
//       AudienceSchool: true,
//       AudienceTeacher: false,
//       AudienceStudent: false,
//       Urgent: false,
//     },
//     validationSchema,
//     onSubmit: async () => {
//       setIsPosting(true);
//       try {
//         await validationSchema.validate(formik.values);
//         setOpenDialog(true);
//       } catch (error) {
//         setAlert({
//           open: true,
//           message: error.message || "Validation failed",
//           severity: "error",
//         });
//       } finally {
//         setIsPosting(false);
//       }
//     },
//   });

//   // Update form values when adminId changes
//   useEffect(() => {
//     if (adminId) {
//       formik.setFieldValue("CreatedBy", adminId);
//     }
//   }, [adminId]);

//   const generateNoticeID = async (type, subType) => {
//     const today = new Date();
//     const year = today.getFullYear();
//     const month = String(today.getMonth() + 1).padStart(2, "0");
//     const day = String(today.getDate()).padStart(2, "0");

//     const typeInitial = type.charAt(0);
//     const subTypeInitial = subType.charAt(0);

//     try {
//       const { data, error } = await supabase
//         .from("Notice")
//         .select("NoticeID")
//         .like(
//           "NoticeID",
//           `N-${typeInitial}-${subTypeInitial}-${year}${month}${day}-%`
//         );

//       if (error) throw error;

//       let nextSerial = 1;
//       if (data && data.length > 0) {
//         const latestNotice = data[data.length - 1].NoticeID;
//         const latestSerial = parseInt(latestNotice.split("-")[4]) || 0;
//         nextSerial = latestSerial + 1;
//       }

//       const newNoticeID = `N-${typeInitial}-${subTypeInitial}-${year}${month}${day}-${nextSerial}`;
//       formik.setFieldValue("NoticeID", newNoticeID);
//     } catch (error) {
//       console.error("Error fetching notice IDs:", error);
//       const newNoticeID = `N-${typeInitial}-${subTypeInitial}-${year}${month}${day}-1`;
//       formik.setFieldValue("NoticeID", newNoticeID);
//     }
//   };

//   useEffect(() => {
//     if (formik.values.Type && formik.values.SubType) {
//       generateNoticeID(formik.values.Type, formik.values.SubType);
//     }
//   }, [formik.values.Type, formik.values.SubType]);

//   const handleDateRangeChange = (newValue) => {
//     formik.setFieldValue("StartDate", newValue[0]);
//     formik.setFieldValue("EndDate", newValue[1]);
//   };

//   const handleAudienceChange = (name) => (event) => {
//     const checked = event.target.checked;

//     if (name === "AudienceStudent") {
//       formik.setValues({
//         ...formik.values,
//         AudienceStudent: checked,
//         AudienceTeacher: checked,
//         AudienceSchool: checked,
//       });
//     } else if (name === "AudienceTeacher") {
//       formik.setValues({
//         ...formik.values,
//         AudienceTeacher: checked,
//         AudienceSchool: checked,
//         AudienceStudent: false,
//       });
//     } else if (name === "AudienceSchool") {
//       formik.setValues({
//         ...formik.values,
//         AudienceSchool: checked,
//         AudienceTeacher: checked ? formik.values.AudienceTeacher : false,
//         AudienceStudent: false,
//       });
//     }
//   };

//   const handleConfirmSubmit = async () => {
//     setIsPosting(true);
//     try {
//       const payload = {
//         NoticeID: formik.values.NoticeID,
//         Title: formik.values.Title,
//         Message: formik.values.Message,
//         Type: formik.values.Type,
//         SubType: formik.values.SubType,
//         CreatedBy: adminId,
//         CreatedType: "Admin",
//         AudienceSchool: formik.values.AudienceSchool,
//         AudienceTeacher: formik.values.AudienceTeacher,
//         AudienceStudent: formik.values.AudienceStudent,
//         Urgent: formik.values.Urgent,
//         StartDate: formik.values.StartDate?.toISOString(),
//         EndDate: formik.values.EndDate?.toISOString(),
//       };

//       const { data, error } = await supabase
//         .from("Notice")
//         .insert([payload])
//         .select();

//       if (error) throw error;

//       setAlert({
//         open: true,
//         message: "Notice posted successfully!",
//         severity: "success",
//       });

//       formik.resetForm();
//       generateNoticeID(formik.values.Type, formik.values.SubType);
//     } catch (error) {
//       setAlert({
//         open: true,
//         message: error.message || "Failed to post notice",
//         severity: "error",
//       });
//     } finally {
//       setIsPosting(false);
//       setOpenDialog(false);
//     }
//   };

//   const handleCloseDialog = () => setOpenDialog(false);
//   const handleCloseAlert = () => setAlert({ ...alert, open: false });

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         bgcolor="#f5f5f5"
//         p={4}
//       >
//         <Card sx={{ maxWidth: 500, width: "100%", p: 3 }}>
//           <CardContent>
//             <Typography variant="h5" fontWeight="bold" mb={2}>
//               Add a Notice
//             </Typography>

//             <form onSubmit={formik.handleSubmit}>
//               <Box display="flex" gap={2} mb={2}>
//                 <FormControl fullWidth>
//                   <InputLabel>Type</InputLabel>
//                   <Select
//                     value={formik.values.Type}
//                     name="Type"
//                     onChange={formik.handleChange}
//                     error={formik.touched.Type && Boolean(formik.errors.Type)}
//                   >
//                     <MenuItem value="Government">Government</MenuItem>
//                     <MenuItem value="School">School</MenuItem>
//                   </Select>
//                 </FormControl>

//                 <FormControl fullWidth>
//                   <InputLabel>Sub-Type</InputLabel>
//                   <Select
//                     value={formik.values.SubType}
//                     name="SubType"
//                     onChange={formik.handleChange}
//                     error={
//                       formik.touched.SubType && Boolean(formik.errors.SubType)
//                     }
//                   >
//                     <MenuItem value="Holiday">Holiday</MenuItem>
//                     <MenuItem value="Event">Event</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Box>

//               <TextField
//                 fullWidth
//                 label="Title *"
//                 name="Title"
//                 value={formik.values.Title}
//                 onChange={formik.handleChange}
//                 error={formik.touched.Title && Boolean(formik.errors.Title)}
//                 helperText={formik.touched.Title && formik.errors.Title}
//                 margin="normal"
//               />

//               <TextField
//                 fullWidth
//                 label="Message *"
//                 multiline
//                 rows={4}
//                 name="Message"
//                 value={formik.values.Message}
//                 onChange={formik.handleChange}
//                 error={formik.touched.Message && Boolean(formik.errors.Message)}
//                 helperText={formik.touched.Message && formik.errors.Message}
//                 margin="normal"
//               />

//               <Box mt={2} mb={2}>
//                 <FormLabel>Audience</FormLabel>
//                 <FormGroup row>
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         // checked={formik.values.AudienceSchool}
//                         onChange={handleAudienceChange("AudienceSchool")}
//                         checked={true}
//                         disabled
//                       />
//                     }
//                     label="School"
//                   />
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={formik.values.AudienceTeacher}
//                         onChange={handleAudienceChange("AudienceTeacher")}
//                       />
//                     }
//                     label="Teacher"
//                   />
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={formik.values.AudienceStudent}
//                         onChange={handleAudienceChange("AudienceStudent")}
//                         disabled={!formik.values.AudienceTeacher}
//                       />
//                     }
//                     label="Student"
//                   />
//                 </FormGroup>
//               </Box>

//               <FormControlLabel
//                 control={
//                   <Switch
//                     checked={formik.values.Urgent}
//                     onChange={formik.handleChange}
//                     name="Urgent"
//                   />
//                 }
//                 label="Mark as Urgent"
//                 sx={{ mb: 2 }}
//               />

//               <DateRangePicker
//                 startText="Start Date *"
//                 endText="End Date *"
//                 value={[formik.values.StartDate, formik.values.EndDate]}
//                 onChange={handleDateRangeChange}
//                 renderInput={(startProps, endProps) => (
//                   <>
//                     <TextField
//                       {...startProps}
//                       fullWidth
//                       margin="normal"
//                       error={
//                         formik.touched.StartDate &&
//                         Boolean(formik.errors.StartDate)
//                       }
//                       helperText={
//                         formik.touched.StartDate && formik.errors.StartDate
//                       }
//                     />
//                     <Box sx={{ mx: 2 }}> to </Box>
//                     <TextField
//                       {...endProps}
//                       fullWidth
//                       margin="normal"
//                       error={
//                         formik.touched.EndDate && Boolean(formik.errors.EndDate)
//                       }
//                       helperText={
//                         formik.touched.EndDate && formik.errors.EndDate
//                       }
//                     />
//                   </>
//                 )}
//               />

//               <Box mt={3} display="flex" justifyContent="center">
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   startIcon={
//                     isPosting ? <CircularProgress size={20} /> : <AddIcon />
//                   }
//                   type="submit"
//                   disabled={isPosting}
//                 >
//                   {isPosting ? "Posting..." : "Post Notice"}
//                 </Button>
//               </Box>
//             </form>
//           </CardContent>
//         </Card>

//         {/* Confirmation Dialog */}
//         <Dialog open={openDialog} onClose={handleCloseDialog}>
//           <DialogTitle>Confirm Notice Submission</DialogTitle>
//           <DialogContent>
//             <DialogContentText>
//               Are you sure you want to post this notice?
//               <br />
//               <br />
//               <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={1}>
//                 <Box>
//                   <Typography variant="body2">
//                     <strong>Title:</strong> {formik.values.Title}
//                   </Typography>
//                   <Typography variant="body2">
//                     <strong>Type:</strong> {formik.values.Type}
//                   </Typography>
//                   <Typography variant="body2">
//                     <strong>Sub-Type:</strong> {formik.values.SubType}
//                   </Typography>
//                 </Box>
//                 <Box>
//                   <Typography variant="body2">
//                     <strong>Audience:</strong>{" "}
//                     {[
//                       formik.values.AudienceSchool ? "School" : null,
//                       formik.values.AudienceTeacher ? "Teacher" : null,
//                       formik.values.AudienceStudent ? "Student" : null,
//                     ]
//                       .filter(Boolean)
//                       .join(", ")}
//                   </Typography>
//                   <Typography variant="body2">
//                     <strong>Urgent:</strong>{" "}
//                     {formik.values.Urgent ? "Yes" : "No"}
//                   </Typography>
//                   <Typography variant="body2">
//                     <strong>Start Date:</strong>{" "}
//                     {formik.values.StartDate?.toLocaleDateString()}
//                   </Typography>
//                   <Typography variant="body2">
//                     <strong>End Date:</strong>{" "}
//                     {formik.values.EndDate?.toLocaleDateString()}
//                   </Typography>
//                 </Box>
//               </Box>
//             </DialogContentText>
//           </DialogContent>
//           <DialogActions>
//             <Button
//               onClick={handleCloseDialog}
//               color="primary"
//               disabled={isPosting}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleConfirmSubmit}
//               color="primary"
//               variant="contained"
//               disabled={isPosting}
//               startIcon={isPosting ? <CircularProgress size={20} /> : null}
//             >
//               {isPosting ? "Posting..." : "Confirm"}
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <Snackbar
//           open={alert.open}
//           autoHideDuration={6000}
//           onClose={handleCloseAlert}
//         >
//           <Alert onClose={handleCloseAlert} severity={alert.severity}>
//             {alert.message}
//           </Alert>
//         </Snackbar>
//       </Box>
//     </LocalizationProvider>
//   );
// };

// export default AddNotice;




"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  Checkbox,
  FormGroup,
  FormLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { useNavigate } from "react-router-dom"
import { useFormik } from "formik"
import * as Yup from "yup"
import supabase from "../../../supabase-client"

const AddNotice = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "",
  })
  const [userEmail, setUserEmail] = useState("")
  const [adminId, setAdminId] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const navigate = useNavigate()

  // Validation Schema
  const validationSchema = Yup.object().shape({
    Title: Yup.string()
      .required("Title is required")
      .matches(/^[a-zA-Z\s]*$/, "Title can only contain letters and spaces"),
    Message: Yup.string().required("Message is required"),
    Type: Yup.string().required("Type is required"),
    SubType: Yup.string().required("Sub-type is required"),
    StartDate: Yup.date().required("Start date is required"),
    EndDate: Yup.date().required("End date is required").min(Yup.ref("StartDate"), "End date must be after start date"),
  })

  // Get current user and admin ID
  useEffect(() => {
    const fetchUserAndAdminId = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError) {
        navigate("/login")
        return
      }
      if (user) {
        setUserEmail(user.email)
        const { data: adminData, error: adminError } = await supabase
          .from("Admin")
          .select("AdminID")
          .eq("Email", user.email)
          .single()
        if (adminError) {
          console.error("Error fetching admin ID:", adminError)
          setAlert({
            open: true,
            message: "Failed to verify admin privileges",
            severity: "error",
          })
          return
        }
        if (adminData) {
          setAdminId(adminData.AdminID)
        } else {
          setAlert({
            open: true,
            message: "Only admins can create notices",
            severity: "error",
          })
          navigate(-1)
        }
      }
    }
    fetchUserAndAdminId()
  }, [navigate])

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      NoticeID: "",
      Title: "",
      Message: "",
      StartDate: null,
      EndDate: null,
      Type: "Government",
      SubType: "Holiday",
      CreatedBy: null,
      AudienceSchool: true,
      AudienceTeacher: false,
      AudienceStudent: false,
      Urgent: false,
    },
    validationSchema,
    onSubmit: async () => {
      setIsPosting(true)
      try {
        await validationSchema.validate(formik.values)
        setOpenDialog(true)
      } catch (error) {
        setAlert({
          open: true,
          message: error.message || "Validation failed",
          severity: "error",
        })
      } finally {
        setIsPosting(false)
      }
    },
  })

  // Update form values when adminId changes
  useEffect(() => {
    if (adminId) {
      formik.setFieldValue("CreatedBy", adminId)
    }
  }, [adminId])

  const generateNoticeID = async (type, subType) => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const typeInitial = type.charAt(0)
    const subTypeInitial = subType.charAt(0)
    try {
      const { data, error } = await supabase
        .from("Notice")
        .select("NoticeID")
        .like("NoticeID", `N-${typeInitial}-${subTypeInitial}-${year}${month}${day}-%`)

      if (error) throw error

      let nextSerial = 1
      if (data && data.length > 0) {
        const latestNotice = data[data.length - 1].NoticeID
        const latestSerial = Number.parseInt(latestNotice.split("-")[4]) || 0
        nextSerial = latestSerial + 1
      }

      const newNoticeID = `N-${typeInitial}-${subTypeInitial}-${year}${month}${day}-${nextSerial}`
      formik.setFieldValue("NoticeID", newNoticeID)
    } catch (error) {
      console.error("Error fetching notice IDs:", error)
      const newNoticeID = `N-${typeInitial}-${subTypeInitial}-${year}${month}${day}-1`
      formik.setFieldValue("NoticeID", newNoticeID)
    }
  }

  useEffect(() => {
    if (formik.values.Type && formik.values.SubType) {
      generateNoticeID(formik.values.Type, formik.values.SubType)
    }
  }, [formik.values.Type, formik.values.SubType])

  const handleDateRangeChange = (newValue) => {
    formik.setFieldValue("StartDate", newValue[0])
    formik.setFieldValue("EndDate", newValue[1])
  }

  const handleAudienceChange = (name) => (event) => {
    const checked = event.target.checked
    if (name === "AudienceStudent") {
      formik.setValues({
        ...formik.values,
        AudienceStudent: checked,
        AudienceTeacher: checked,
        AudienceSchool: checked,
      })
    } else if (name === "AudienceTeacher") {
      formik.setValues({
        ...formik.values,
        AudienceTeacher: checked,
        AudienceSchool: checked,
        AudienceStudent: false,
      })
    } else if (name === "AudienceSchool") {
      formik.setValues({
        ...formik.values,
        AudienceSchool: checked,
        AudienceTeacher: checked ? formik.values.AudienceTeacher : false,
        AudienceStudent: false,
      })
    }
  }

  const handleConfirmSubmit = async () => {
    setIsPosting(true)
    try {
      const payload = {
        NoticeID: formik.values.NoticeID,
        Title: formik.values.Title,
        Message: formik.values.Message,
        Type: formik.values.Type,
        SubType: formik.values.SubType,
        CreatedBy: adminId,
        CreatedType: "Admin",
        AudienceSchool: formik.values.AudienceSchool,
        AudienceTeacher: formik.values.AudienceTeacher,
        AudienceStudent: formik.values.AudienceStudent,
        Urgent: formik.values.Urgent,
        StartDate: formik.values.StartDate?.toISOString(),
        EndDate: formik.values.EndDate?.toISOString(),
      }

      const { data, error } = await supabase.from("Notice").insert([payload]).select()

      if (error) throw error

      setAlert({
        open: true,
        message: "Notice posted successfully!",
        severity: "success",
      })
      formik.resetForm()
      generateNoticeID(formik.values.Type, formik.values.SubType)
    } catch (error) {
      setAlert({
        open: true,
        message: error.message || "Failed to post notice",
        severity: "error",
      })
    } finally {
      setIsPosting(false)
      setOpenDialog(false)
    }
  }

  const handleCloseDialog = () => setOpenDialog(false)
  const handleCloseAlert = () => setAlert({ ...alert, open: false })

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="flex-start"
        bgcolor="#f5f5f5"
        p={isMobile ? 1 : isTablet ? 2 : 4}
        minHeight="100vh"
      >
        <Card
          sx={{
            maxWidth: isMobile ? "100%" : isTablet ? 600 : 500,
            width: "100%",
            padding: isMobile ? 1 : isTablet ? 2 : 3,
            margin: isMobile ? 0 : "auto",
            boxShadow: 6,
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ padding: isMobile ? 1 : 2 }}>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              fontWeight="bold"
              mb={isMobile ? 2 : 3}
              sx={{
                textAlign: isMobile ? "center" : "left",
                fontSize: isMobile ? "1.25rem" : "1.5rem",
                color: "#3f51b5",
              }}
            >
              Add a Notice
            </Typography>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: isMobile ? 1 : 2 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: isMobile ? "0.875rem" : "1rem",
                      },
                    }}
                  >
                    <InputLabel sx={{ fontSize: isMobile ? "0.875rem" : "1rem" }}>Type</InputLabel>
                    <Select
                      value={formik.values.Type}
                      name="Type"
                      onChange={formik.handleChange}
                      error={formik.touched.Type && Boolean(formik.errors.Type)}
                      label="Type"
                    >
                      <MenuItem value="Government">Government</MenuItem>
                      <MenuItem value="School">School</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: isMobile ? "0.875rem" : "1rem",
                      },
                    }}
                  >
                    <InputLabel sx={{ fontSize: isMobile ? "0.875rem" : "1rem" }}>Sub-Type</InputLabel>
                    <Select
                      value={formik.values.SubType}
                      name="SubType"
                      onChange={formik.handleChange}
                      error={formik.touched.SubType && Boolean(formik.errors.SubType)}
                      label="Sub-Type"
                    >
                      <MenuItem value="Holiday">Holiday</MenuItem>
                      <MenuItem value="Event">Event</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Title *"
                name="Title"
                value={formik.values.Title}
                onChange={formik.handleChange}
                error={formik.touched.Title && Boolean(formik.errors.Title)}
                helperText={formik.touched.Title && formik.errors.Title}
                margin="normal"
                size={isMobile ? "small" : "medium"}
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: isMobile ? "0.875rem" : "1rem",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: isMobile ? "0.875rem" : "1rem",
                  },
                  "& .MuiFormHelperText-root": {
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                  },
                }}
              />

              <TextField
                fullWidth
                label="Message *"
                multiline
                rows={isMobile ? 3 : 4}
                name="Message"
                value={formik.values.Message}
                onChange={formik.handleChange}
                error={formik.touched.Message && Boolean(formik.errors.Message)}
                helperText={formik.touched.Message && formik.errors.Message}
                margin="normal"
                size={isMobile ? "small" : "medium"}
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: isMobile ? "0.875rem" : "1rem",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: isMobile ? "0.875rem" : "1rem",
                  },
                  "& .MuiFormHelperText-root": {
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                  },
                }}
              />

              <Box mt={isMobile ? 1 : 2} mb={isMobile ? 1 : 2}>
                <FormLabel
                  sx={{
                    fontSize: isMobile ? "0.875rem" : "1rem",
                    fontWeight: "medium",
                    color: "rgba(0, 0, 0, 0.87)",
                  }}
                >
                  Audience
                </FormLabel>
                <FormGroup row={!isMobile} sx={{ mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        onChange={handleAudienceChange("AudienceSchool")}
                        checked={true}
                        disabled
                        size={isMobile ? "small" : "medium"}
                      />
                    }
                    label={<Typography sx={{ fontSize: isMobile ? "0.875rem" : "1rem" }}>School</Typography>}
                    sx={{ mb: isMobile ? 0.5 : 0 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.AudienceTeacher}
                        onChange={handleAudienceChange("AudienceTeacher")}
                        size={isMobile ? "small" : "medium"}
                      />
                    }
                    label={<Typography sx={{ fontSize: isMobile ? "0.875rem" : "1rem" }}>Teacher</Typography>}
                    sx={{ mb: isMobile ? 0.5 : 0 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.AudienceStudent}
                        onChange={handleAudienceChange("AudienceStudent")}
                        disabled={!formik.values.AudienceTeacher}
                        size={isMobile ? "small" : "medium"}
                      />
                    }
                    label={<Typography sx={{ fontSize: isMobile ? "0.875rem" : "1rem" }}>Student</Typography>}
                    sx={{ mb: isMobile ? 0.5 : 0 }}
                  />
                </FormGroup>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.Urgent}
                    onChange={formik.handleChange}
                    name="Urgent"
                    size={isMobile ? "small" : "medium"}
                  />
                }
                label={<Typography sx={{ fontSize: isMobile ? "0.875rem" : "1rem" }}>Mark as Urgent</Typography>}
                sx={{ mb: isMobile ? 1 : 2 }}
              />

              <Box sx={{ mt: isMobile ? 1 : 2, mb: isMobile ? 1 : 2 }}>
                <DateRangePicker
                  startText="Start Date *"
                  endText="End Date *"
                  value={[formik.values.StartDate, formik.values.EndDate]}
                  onChange={handleDateRangeChange}
                  renderInput={(startProps, endProps) => (
                    <Grid container spacing={isMobile ? 1 : 2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...startProps}
                          fullWidth
                          margin="normal"
                          size={isMobile ? "small" : "medium"}
                          error={formik.touched.StartDate && Boolean(formik.errors.StartDate)}
                          helperText={formik.touched.StartDate && formik.errors.StartDate}
                          sx={{
                            "& .MuiInputBase-root": {
                              fontSize: isMobile ? "0.875rem" : "1rem",
                            },
                            "& .MuiInputLabel-root": {
                              fontSize: isMobile ? "0.875rem" : "1rem",
                            },
                            "& .MuiFormHelperText-root": {
                              fontSize: isMobile ? "0.75rem" : "0.875rem",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          {...endProps}
                          fullWidth
                          margin="normal"
                          size={isMobile ? "small" : "medium"}
                          error={formik.touched.EndDate && Boolean(formik.errors.EndDate)}
                          helperText={formik.touched.EndDate && formik.errors.EndDate}
                          sx={{
                            "& .MuiInputBase-root": {
                              fontSize: isMobile ? "0.875rem" : "1rem",
                            },
                            "& .MuiInputLabel-root": {
                              fontSize: isMobile ? "0.875rem" : "1rem",
                            },
                            "& .MuiFormHelperText-root": {
                              fontSize: isMobile ? "0.75rem" : "0.875rem",
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  )}
                />
              </Box>

              <Box mt={isMobile ? 2 : 3} display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={isPosting ? <CircularProgress size={isMobile ? 16 : 20} /> : <AddIcon />}
                  type="submit"
                  disabled={isPosting}
                  size={isMobile ? "medium" : "large"}
                  sx={{
                    fontSize: isMobile ? "0.875rem" : "1rem",
                    padding: isMobile ? "8px 16px" : "10px 20px",
                    minWidth: isMobile ? "140px" : "160px",
                  }}
                >
                  {isPosting ? "Posting..." : "Post Notice"}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              margin: isMobile ? 1 : 3,
              width: isMobile ? "calc(100% - 16px)" : "auto",
              maxHeight: isMobile ? "90vh" : "80vh",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontSize: isMobile ? "1.1rem" : "1.25rem",
              padding: isMobile ? "12px 16px" : "16px 24px",
              color: "#3f51b5",
              fontWeight: "bold",
            }}
          >
            Confirm Notice Submission
          </DialogTitle>
          <DialogContent
            sx={{
              padding: isMobile ? "8px 16px" : "16px 24px",
              overflowY: "auto",
            }}
          >
            <DialogContentText
              sx={{
                fontSize: isMobile ? "0.875rem" : "1rem",
                mb: 2,
              }}
            >
              Are you sure you want to post this notice?
            </DialogContentText>
            <Grid container spacing={isMobile ? 1 : 2}>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    mb: 1,
                    wordBreak: "break-word",
                  }}
                >
                  <strong>Title:</strong> {formik.values.Title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    mb: 1,
                  }}
                >
                  <strong>Type:</strong> {formik.values.Type}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    mb: 1,
                  }}
                >
                  <strong>Sub-Type:</strong> {formik.values.SubType}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    mb: 1,
                  }}
                >
                  <strong>Audience:</strong>{" "}
                  {[
                    formik.values.AudienceSchool ? "School" : null,
                    formik.values.AudienceTeacher ? "Teacher" : null,
                    formik.values.AudienceStudent ? "Student" : null,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    mb: 1,
                  }}
                >
                  <strong>Urgent:</strong> {formik.values.Urgent ? "Yes" : "No"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    mb: 1,
                  }}
                >
                  <strong>Start Date:</strong> {formik.values.StartDate?.toLocaleDateString()}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    mb: 1,
                  }}
                >
                  <strong>End Date:</strong> {formik.values.EndDate?.toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions
            sx={{
              padding: isMobile ? "8px 16px 16px" : "8px 24px 24px",
              gap: isMobile ? 1 : 0,
              flexDirection: isMobile ? "column-reverse" : "row",
            }}
          >
            <Button
              onClick={handleCloseDialog}
              color="primary"
              disabled={isPosting}
              size={isMobile ? "small" : "medium"}
              fullWidth={isMobile}
              sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              color="primary"
              variant="contained"
              disabled={isPosting}
              startIcon={isPosting ? <CircularProgress size={isMobile ? 16 : 20} /> : null}
              size={isMobile ? "small" : "medium"}
              fullWidth={isMobile}
              sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
            >
              {isPosting ? "Posting..." : "Confirm"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={alert.open}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
          anchorOrigin={{
            vertical: isMobile ? "top" : "bottom",
            horizontal: "center",
          }}
        >
          <Alert
            onClose={handleCloseAlert}
            severity={alert.severity}
            sx={{
              width: isMobile ? "90vw" : "100%",
              maxWidth: isMobile ? "90vw" : "600px",
              fontSize: isMobile ? "0.875rem" : "1rem",
            }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  )
}

export default AddNotice
