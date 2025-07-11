// import React, { useState, useEffect } from "react";
// import {
//   TextField,
//   Button,
//   Grid,
//   Paper,
//   Typography,
//   Checkbox,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Snackbar,
//   Alert,
//   CircularProgress,
//   FormControlLabel,
//   Box,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogContentText,
//   DialogActions,
// } from "@mui/material";
// import supabase from "../../../supabase-client";
// import { useFormik } from "formik";
// import { Autocomplete } from "@mui/material";

// import * as Yup from "yup";

// // Validation Schema
// const schoolSchema = Yup.object().shape({
//   email: Yup.string()
//     .email("Invalid email")
//     .required("Email is required")
//     .test(
//       "unique-email",
//       "This email is already in use",
//       async function (value) {
//         if (!value) return true;

//         try {
//           const { data, error } = await supabase
//             .from("School")
//             .select("Email")
//             .eq("Email", value)
//             .neq("SchoolID", this.parent.ID || "");

//           if (error) throw error;
//           return data.length === 0;
//         } catch (error) {
//           console.error("Error checking email:", error);
//           return false;
//         }
//       }
//     ),
//   name: Yup.string().required("School name is required"),
//   schoollevel: Yup.string().required("School level is required"),
//   address: Yup.string().required("Address is required"),
//   phoneNumber: Yup.string()
//     .matches(/^[0-9]+$/, "Only digits are allowed")
//     .min(9, "Phone number must be at least 9 digits")
//     .max(12, "Phone number cannot be more than 12 digits")
//     .required("Phone number is required")
//     .test(
//       "unique-phone",
//       "This phone number is already in use",
//       async function (value) {
//         if (!value) return true;

//         try {
//           const { data, error } = await supabase
//             .from("School")
//             .select("PhoneNumber")
//             .eq("PhoneNumber", value)
//             .neq("SchoolID", this.parent.ID || "");

//           if (error) throw error;
//           return data.length === 0;
//         } catch (error) {
//           console.error("Error checking phone number:", error);
//           return false;
//         }
//       }
//     ),
//   establishedYear: Yup.number()
//     .min(1947, "Year must be 1947 or later")
//     .max(
//       new Date().getFullYear(),
//       `Year cannot be after ${new Date().getFullYear()}`
//     )
//     .required("Established year is required"),
//   recognizedbyboard: Yup.string().test(
//     "both-or-none",
//     "Both recognized by board and attestation ID are required",
//     function (value) {
//       const { boardattestationId } = this.parent;
//       return !(
//         (value && !boardattestationId) ||
//         (!value && boardattestationId)
//       );
//     }
//   ),
//   boardattestationId: Yup.string().test(
//     "both-or-none",
//     "Both recognized by board and attestation ID are required",
//     function (value) {
//       const { recognizedbyboard } = this.parent;
//       return !((value && !recognizedbyboard) || (!value && recognizedbyboard));
//     }
//   ),
// });

// const EditSchool = () => {
//   const [schools, setSchools] = useState([]);
//   const [schoolId, setSchoolId] = useState("");
//   const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

//   const [initialValues, setInitialValues] = useState({
//     ID: "",
//     email: "",
//     name: "",
//     schoolfor: "",
//     schoollevel: "",
//     address: "",
//     phoneNumber: "",
//     establishedYear: "",
//     library: false,
//     sports: false,
//     computerLab: false,
//     scienceLab: false,
//     recognizedbyboard: "",
//     boardattestationId: "",
//   });

//   const [alert, setAlert] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });
//   const [loading, setLoading] = useState({
//     schools: false,
//     details: false,
//     submit: false,
//   });

//   const formik = useFormik({
//     initialValues,
//     validationSchema: schoolSchema,
//     enableReinitialize: true,
//     onSubmit: async (values) => {
//       await handleSubmit(values);
//     },
//   });

//   useEffect(() => {
//     fetchSchools();
//   }, []);

//   useEffect(() => {
//     if (schoolId) {
//       fetchSchoolDetails();
//     }
//   }, [schoolId]);

//   const fetchSchools = async () => {
//     try {
//       setLoading((prev) => ({ ...prev, schools: true }));
//       const { data, error } = await supabase
//         .from("School")
//         .select("*")
//         .order("SchoolID", { ascending: true });

//       if (error) throw error;
//       setSchools(data);
//     } catch (error) {
//       console.error("Error fetching schools:", error);
//       showAlert("Failed to load schools!", "error");
//     } finally {
//       setLoading((prev) => ({ ...prev, schools: false }));
//     }
//   };

//   const fetchSchoolDetails = async () => {
//     try {
//       setLoading((prev) => ({ ...prev, details: true }));
//       const { data, error } = await supabase
//         .from("School")
//         .select("*")
//         .eq("SchoolID", schoolId)
//         .single();

//       if (error) throw error;

//       setInitialValues({
//         ID: data.SchoolID,
//         email: data.Email || "",
//         name: data.SchoolName || "",
//         schoolfor: data.SchoolFor || "",
//         schoollevel: data.SchoolLevel || "",
//         address: data.Address || "",
//         phoneNumber: data.PhoneNumber || "",
//         establishedYear: data.EstablishedYear || "",
//         library: data.Library || false,
//         sports: data.SportsGround || false,
//         computerLab: data.ComputerLab || false,
//         scienceLab: data.ScienceLab || false,
//         recognizedbyboard: data.Recognizedbyboard || "",
//         boardattestationId: data.BoardattestationId || "",
//       });
//     } catch (error) {
//       console.error("Error fetching school details:", error);
//       showAlert("Failed to load school details!", "error");
//     } finally {
//       setLoading((prev) => ({ ...prev, details: false }));
//     }
//   };

//   const handleSubmit = async (values) => {
//     try {
//       setLoading((prev) => ({ ...prev, submit: true }));

//       const updateData = {
//         Email: values.email,
//         SchoolName: values.name,
//         SchoolFor: values.schoolfor,
//         SchoolLevel: values.schoollevel,
//         Address: values.address,
//         PhoneNumber: values.phoneNumber,
//         EstablishedYear: values.establishedYear
//           ? parseInt(values.establishedYear)
//           : null,
//         Library: values.library,
//         SportsGround: values.sports,
//         ComputerLab: values.computerLab,
//         ScienceLab: values.scienceLab,
//         Recognizedbyboard: values.recognizedbyboard || null,
//         BoardattestationId: values.boardattestationId || null,
//       };

//       const { error } = await supabase
//         .from("School")
//         .update(updateData)
//         .eq("SchoolID", values.ID);

//       if (error) throw error;

//       showAlert("School updated successfully!", "success");

//       // Refresh the schools list and reset the form
//       setSchoolId("");
//       // await fetchSchools();
//       // if (schoolId) {
//       //   await fetchSchoolDetails();
//       // }
//     } catch (error) {
//       console.error("Error updating school:", error);
//       showAlert(
//         error.message || "Failed to update school. Try again!",
//         "error"
//       );
//     } finally {
//       setLoading((prev) => ({ ...prev, submit: false }));
//     }
//   };

//   const showAlert = (message, severity) => {
//     setAlert({ open: true, message, severity });
//   };

//   const handleCloseAlert = () => setAlert({ ...alert, open: false });

//   const handleCheckboxChange = (event) => {
//     formik.setFieldValue(event.target.name, event.target.checked);
//   };

//   const handlePhoneNumberChange = (e) => {
//     // Remove any non-digit characters
//     const digitsOnly = e.target.value.replace(/\D/g, "");
//     formik.setFieldValue("phoneNumber", digitsOnly);
//   };

//   const handleSubmitClick = () => {
//     console.log("Validating form...");
//     formik.validateForm().then((errors) => {
//       console.log("Validating form...", errors);

//       if (Object.keys(errors).length === 0) {
//         setOpenConfirmDialog(true); // Open dialog if no errors
//       }
//     });
//   };
//   const handleConfirmSubmit = () => {
//     setOpenConfirmDialog(false);
//     formik.handleSubmit(); // Proceed with submission
//   };

//   return (
//     <Paper sx={{ padding: 3, maxWidth: 800, margin: "20px auto" }}>
//       <Typography variant="h4" gutterBottom>
//         Edit School
//       </Typography>

//       {/* <FormControl fullWidth sx={{ mb: 3 }}>
//         <InputLabel>Select School</InputLabel>
//         <Select
//           value={schoolId}
//           onChange={(e) => setSchoolId(e.target.value)}
//           label="Select School"
//           disabled={loading.schools}
//         >
//           {loading.schools && (
//             <MenuItem disabled>
//               <CircularProgress size={24} />
//             </MenuItem>
//           )}
//           {schools.map((school) => (
//             <MenuItem key={school.SchoolID} value={school.SchoolID}>
//               {school.SchoolID} - {school.SchoolName}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl> */}
//       <Autocomplete
//         options={schools}
//         getOptionLabel={(option) => `${option.SchoolID} - ${option.SchoolName}`}
//         loading={loading.schools}
//         value={schools.find((s) => s.SchoolID === schoolId) || null}
//         onChange={(event, newValue) => {
//           setSchoolId(newValue ? newValue.SchoolID : "");
//         }}
//         renderInput={(params) => (
//           <TextField
//             {...params}
//             label="Select School"
//             fullWidth
//             InputProps={{
//               ...params.InputProps,
//               endAdornment: (
//                 <>
//                   {loading.schools ? <CircularProgress size={20} /> : null}
//                   {params.InputProps.endAdornment}
//                 </>
//               ),
//             }}
//           />
//         )}
//         sx={{ mb: 3 }}
//       />

//       {loading.details ? (
//         <Box display="flex" justifyContent="center" my={4}>
//           <CircularProgress />
//         </Box>
//       ) : (
//         schoolId && (
//           <form onSubmit={formik.handleSubmit}>
//             <Grid container spacing={2}>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="School Name"
//                   name="name"
//                   value={formik.values.name}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   error={formik.touched.name && Boolean(formik.errors.name)}
//                   helperText={formik.touched.name && formik.errors.name}
//                   fullWidth
//                   required
//                 />
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="Email"
//                   name="email"
//                   type="email"
//                   value={formik.values.email}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   error={formik.touched.email && Boolean(formik.errors.email)}
//                   helperText={formik.touched.email && formik.errors.email}
//                   fullWidth
//                   required
//                   InputProps={{
//                     readOnly: true,
//                   }}
//                   sx={{
//                     "& .MuiInputBase-input.Mui-readOnly": {
//                       cursor: "not-allowed",
//                       backgroundColor: "#f5f5f5", // Optional: add a light gray background
//                     },
//                   }}
//                 />
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="School For"
//                   name="schoolfor"
//                   value={formik.values.schoolfor}
//                   InputProps={{
//                     readOnly: true,
//                   }}
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <FormControl fullWidth>
//                   <InputLabel>School Level *</InputLabel>
//                   <Select
//                     name="schoollevel"
//                     value={formik.values.schoollevel}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     error={
//                       formik.touched.schoollevel &&
//                       Boolean(formik.errors.schoollevel)
//                     }
//                     label="School Level *"
//                   >
//                     <MenuItem value="Primary">Primary</MenuItem>
//                     <MenuItem value="Secondary">Secondary</MenuItem>
//                     <MenuItem value="High">High</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>

//               {/* <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="Phone Number *"
//                   name="phoneNumber"
//                   value={formik.values.phoneNumber}
//                   onChange={(e) => {
//                     // Only allow numeric input
//                     const re = /^[0-9\b]+$/;
//                     if (e.target.value === "" || re.test(e.target.value)) {
//                       formik.handleChange(e);
//                     }
//                   }}
//                   onBlur={formik.handleBlur}
//                   error={
//                     formik.touched.phoneNumber &&
//                     Boolean(formik.errors.phoneNumber)
//                   }
//                   helperText={
//                     formik.touched.phoneNumber && formik.errors.phoneNumber
//                   }
//                   fullWidth
//                   inputProps={{
//                     maxLength: 12,
//                   }}
//                 />
//               </Grid> */}

//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="Phone Number *"
//                   name="phoneNumber"
//                   value={formik.values.phoneNumber}
//                   onChange={handlePhoneNumberChange}
//                   onBlur={formik.handleBlur}
//                   error={
//                     formik.touched.phoneNumber &&
//                     Boolean(formik.errors.phoneNumber)
//                   }
//                   helperText={
//                     formik.touched.phoneNumber &&
//                     (formik.errors.phoneNumber ||
//                       (formik.values.phoneNumber &&
//                         `Entered: ${formik.values.phoneNumber.length} digits`))
//                   }
//                   fullWidth
//                   inputProps={{
//                     maxLength: 12,
//                     inputMode: "numeric",
//                   }}
//                 />
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="Established Year *"
//                   name="establishedYear"
//                   type="number"
//                   value={formik.values.establishedYear}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   error={
//                     formik.touched.establishedYear &&
//                     Boolean(formik.errors.establishedYear)
//                   }
//                   helperText={
//                     formik.touched.establishedYear &&
//                     formik.errors.establishedYear
//                   }
//                   fullWidth
//                   inputProps={{
//                     min: 1947,
//                     max: new Date().getFullYear(),
//                   }}
//                 />
//               </Grid>

//               <Grid item xs={12}>
//                 <TextField
//                   label="Address *"
//                   name="address"
//                   value={formik.values.address}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   error={
//                     formik.touched.address && Boolean(formik.errors.address)
//                   }
//                   helperText={formik.touched.address && formik.errors.address}
//                   fullWidth
//                   multiline
//                   rows={3}
//                 />
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="Recognized by Board"
//                   name="recognizedbyboard"
//                   value={formik.values.recognizedbyboard}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   error={
//                     formik.touched.recognizedbyboard &&
//                     (Boolean(formik.errors.recognizedbyboard) ||
//                       (formik.values.boardattestationId &&
//                         !formik.values.recognizedbyboard))
//                   }
//                   helperText={
//                     formik.touched.recognizedbyboard &&
//                     (formik.errors.recognizedbyboard ||
//                       (formik.values.boardattestationId &&
//                       !formik.values.recognizedbyboard
//                         ? "Both fields are required when either is provided"
//                         : ""))
//                   }
//                   fullWidth
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   label="Attestation ID"
//                   name="boardattestationId"
//                   value={formik.values.boardattestationId}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   error={
//                     formik.touched.boardattestationId &&
//                     (Boolean(formik.errors.boardattestationId) ||
//                       (formik.values.recognizedbyboard &&
//                         !formik.values.boardattestationId))
//                   }
//                   helperText={
//                     formik.touched.boardattestationId &&
//                     (formik.errors.boardattestationId ||
//                       (formik.values.recognizedbyboard &&
//                       !formik.values.boardattestationId
//                         ? "Both fields are required when either is provided"
//                         : ""))
//                   }
//                   fullWidth
//                 />
//               </Grid>

//               <Grid item xs={12}>
//                 <Typography variant="h6" gutterBottom>
//                   Facilities
//                 </Typography>
//                 <Grid container spacing={1}>
//                   {[
//                     { name: "library", label: "Library" },
//                     { name: "sports", label: "Sports Ground" },
//                     { name: "computerLab", label: "Computer Lab" },
//                     { name: "scienceLab", label: "Science Lab" },
//                   ].map((facility) => (
//                     <Grid item key={facility.name}>
//                       <FormControlLabel
//                         control={
//                           <Checkbox
//                             checked={formik.values[facility.name]}
//                             onChange={handleCheckboxChange}
//                             name={facility.name}
//                           />
//                         }
//                         label={facility.label}
//                       />
//                     </Grid>
//                   ))}
//                 </Grid>
//               </Grid>

//               <Grid item xs={12}>
//                 {/* <Button
//                   type="submit"
//                   variant="contained"
//                   color="primary"
//                   fullWidth
//                   disabled={loading.submit}
//                   startIcon={
//                     loading.submit ? <CircularProgress size={20} /> : null
//                   }
//                 >
//                   {loading.submit ? "Updating..." : "Update School"}
//                 </Button> */}

//                 <Button
//                   onClick={handleSubmitClick} // Not formik.handleSubmit
//                   variant="contained"
//                   color="primary"
//                   fullWidth
//                   disabled={loading.submit}
//                 >
//                   {loading.submit ? "Updating..." : "Update School"}
//                 </Button>
//               </Grid>
//             </Grid>
//           </form>
//         )
//       )}

//       <Snackbar
//         open={alert.open}
//         autoHideDuration={6000}
//         onClose={handleCloseAlert}
//       >
//         <Alert onClose={handleCloseAlert} severity={alert.severity}>
//           {alert.message}
//         </Alert>
//       </Snackbar>
//       <Dialog
//         open={openConfirmDialog}
//         onClose={() => setOpenConfirmDialog(false)}
//       >
//         <DialogTitle>Confirm School Updation</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Are you sure you want to update details of this School?
//             <br />
//             <br />
//             <strong>School ID:</strong> {formik.values.ID}
//             <br />
//             <strong>Email:</strong> {formik.values.email}
//             <br />
//             <br />
//             It cannot be undone.
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
//             Cancel
//           </Button>
//           <Button
//             onClick={handleConfirmSubmit}
//             color="primary"
//             variant="contained"
//           >
//             Confirm
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Paper>
//   );
// };

// export default EditSchool;





"use client"

import { useState, useEffect } from "react"
import {
  TextField,
  Button,
  Grid,
  Typography,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  FormControlLabel,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import supabase from "../../../supabase-client"
import { useFormik } from "formik"
import { Autocomplete } from "@mui/material"
import * as Yup from "yup"

// Validation Schema
const schoolSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .required("Email is required")
    .test("unique-email", "This email is already in use", async function (value) {
      if (!value) return true
      try {
        const { data, error } = await supabase
          .from("School")
          .select("Email")
          .eq("Email", value)
          .neq("SchoolID", this.parent.ID || "")
        if (error) throw error
        return data.length === 0
      } catch (error) {
        console.error("Error checking email:", error)
        return false
      }
    }),
  name: Yup.string().required("School name is required"),
  schoollevel: Yup.string().required("School level is required"),
  address: Yup.string().required("Address is required"),
  phoneNumber: Yup.string()
    .matches(/^[0-9]+$/, "Only digits are allowed")
    .min(9, "Phone number must be at least 9 digits")
    .max(12, "Phone number cannot be more than 12 digits")
    .required("Phone number is required")
    .test("unique-phone", "This phone number is already in use", async function (value) {
      if (!value) return true
      try {
        const { data, error } = await supabase
          .from("School")
          .select("PhoneNumber")
          .eq("PhoneNumber", value)
          .neq("SchoolID", this.parent.ID || "")
        if (error) throw error
        return data.length === 0
      } catch (error) {
        console.error("Error checking phone number:", error)
        return false
      }
    }),
  establishedYear: Yup.number()
    .min(1947, "Year must be 1947 or later")
    .max(new Date().getFullYear(), `Year cannot be after ${new Date().getFullYear()}`)
    .required("Established year is required"),
  recognizedbyboard: Yup.string().test(
    "both-or-none",
    "Both recognized by board and attestation ID are required",
    function (value) {
      const { boardattestationId } = this.parent
      return !((value && !boardattestationId) || (!value && boardattestationId))
    },
  ),
  boardattestationId: Yup.string().test(
    "both-or-none",
    "Both recognized by board and attestation ID are required",
    function (value) {
      const { recognizedbyboard } = this.parent
      return !((value && !recognizedbyboard) || (!value && recognizedbyboard))
    },
  ),
})

const EditSchool = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))

  const [schools, setSchools] = useState([])
  const [schoolId, setSchoolId] = useState("")
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [initialValues, setInitialValues] = useState({
    ID: "",
    email: "",
    name: "",
    schoolfor: "",
    schoollevel: "",
    address: "",
    phoneNumber: "",
    establishedYear: "",
    library: false,
    sports: false,
    computerLab: false,
    scienceLab: false,
    recognizedbyboard: "",
    boardattestationId: "",
  })
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  })
  const [loading, setLoading] = useState({
    schools: false,
    details: false,
    submit: false,
  })

  const formik = useFormik({
    initialValues,
    validationSchema: schoolSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await handleSubmit(values)
    },
  })

  useEffect(() => {
    fetchSchools()
  }, [])

  useEffect(() => {
    if (schoolId) {
      fetchSchoolDetails()
    }
  }, [schoolId])

  const fetchSchools = async () => {
    try {
      setLoading((prev) => ({ ...prev, schools: true }))
      const { data, error } = await supabase.from("School").select("*").order("SchoolID", { ascending: true })
      if (error) throw error
      setSchools(data)
    } catch (error) {
      console.error("Error fetching schools:", error)
      showAlert("Failed to load schools!", "error")
    } finally {
      setLoading((prev) => ({ ...prev, schools: false }))
    }
  }

  const fetchSchoolDetails = async () => {
    try {
      setLoading((prev) => ({ ...prev, details: true }))
      const { data, error } = await supabase.from("School").select("*").eq("SchoolID", schoolId).single()
      if (error) throw error
      setInitialValues({
        ID: data.SchoolID,
        email: data.Email || "",
        name: data.SchoolName || "",
        schoolfor: data.SchoolFor || "",
        schoollevel: data.SchoolLevel || "",
        address: data.Address || "",
        phoneNumber: data.PhoneNumber || "",
        establishedYear: data.EstablishedYear || "",
        library: data.Library || false,
        sports: data.SportsGround || false,
        computerLab: data.ComputerLab || false,
        scienceLab: data.ScienceLab || false,
        recognizedbyboard: data.Recognizedbyboard || "",
        boardattestationId: data.BoardattestationId || "",
      })
    } catch (error) {
      console.error("Error fetching school details:", error)
      showAlert("Failed to load school details!", "error")
    } finally {
      setLoading((prev) => ({ ...prev, details: false }))
    }
  }

  const handleSubmit = async (values) => {
    try {
      setLoading((prev) => ({ ...prev, submit: true }))
      const updateData = {
        Email: values.email,
        SchoolName: values.name,
        SchoolFor: values.schoolfor,
        SchoolLevel: values.schoollevel,
        Address: values.address,
        PhoneNumber: values.phoneNumber,
        EstablishedYear: values.establishedYear ? Number.parseInt(values.establishedYear) : null,
        Library: values.library,
        SportsGround: values.sports,
        ComputerLab: values.computerLab,
        ScienceLab: values.scienceLab,
        Recognizedbyboard: values.recognizedbyboard || null,
        BoardattestationId: values.boardattestationId || null,
      }

      const { error } = await supabase.from("School").update(updateData).eq("SchoolID", values.ID)

      if (error) throw error

      showAlert("School updated successfully!", "success")
      setSchoolId("")
    } catch (error) {
      console.error("Error updating school:", error)
      showAlert(error.message || "Failed to update school. Try again!", "error")
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }))
    }
  }

  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity })
  }

  const handleCloseAlert = () => setAlert({ ...alert, open: false })

  const handleCheckboxChange = (event) => {
    formik.setFieldValue(event.target.name, event.target.checked)
  }

  const handlePhoneNumberChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "")
    formik.setFieldValue("phoneNumber", digitsOnly)
  }

  const handleSubmitClick = () => {
    console.log("Validating form...")
    formik.validateForm().then((errors) => {
      console.log("Validating form...", errors)
      if (Object.keys(errors).length === 0) {
        setOpenConfirmDialog(true)
      }
    })
  }

  const handleConfirmSubmit = () => {
    setOpenConfirmDialog(false)
    formik.handleSubmit()
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        p: isMobile ? 1 : isTablet ? 2 : 4,
        backgroundColor: "#f5f5f5",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: isMobile ? "100%" : 800,
          boxShadow: isMobile ? 1 : 3,
        }}
      >
        <CardContent
          sx={{
            p: isMobile ? 2 : isTablet ? 3 : 4,
          }}
        >
          <Typography
            variant={isMobile ? "h5" : "h4"}
            align="center"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: "#1976d2",
              fontSize: isMobile ? "1.5rem" : isTablet ? "1.75rem" : "2rem",
              mb: isMobile ? 2 : 3,
            }}
          >
            Edit School
          </Typography>

          {/* School Selection Section */}
          <Box sx={{ mb: isMobile ? 2 : 3 }}>
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              sx={{
                fontWeight: 600,
                mb: isMobile ? 1 : 2,
                fontSize: isMobile ? "1rem" : "1.25rem",
                color: "#333",
              }}
            >
              School Selection
            </Typography>
            <Divider sx={{ mb: isMobile ? 1.5 : 2 }} />

            <Autocomplete
              options={schools}
              getOptionLabel={(option) => `${option.SchoolID} - ${option.SchoolName}`}
              loading={loading.schools}
              value={schools.find((s) => s.SchoolID === schoolId) || null}
              onChange={(event, newValue) => {
                setSchoolId(newValue ? newValue.SchoolID : "")
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select School"
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    "& .MuiInputLabel-root": {
                      fontSize: isMobile ? "0.875rem" : "1rem",
                    },
                    "& .MuiInputBase-input": {
                      fontSize: isMobile ? "0.875rem" : "1rem",
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading.schools ? <CircularProgress size={isMobile ? 16 : 20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>

          {loading.details ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress size={isMobile ? 32 : 40} />
            </Box>
          ) : (
            schoolId && (
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={isMobile ? 1.5 : 2}>
                  {/* Basic Information Section */}
                  <Grid item xs={12}>
                    <Typography
                      variant={isMobile ? "subtitle1" : "h6"}
                      sx={{
                        fontWeight: 600,
                        mb: isMobile ? 1 : 2,
                        fontSize: isMobile ? "1rem" : "1.25rem",
                        color: "#333",
                      }}
                    >
                      Basic Information
                    </Typography>
                    <Divider sx={{ mb: isMobile ? 1.5 : 2 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="School Name"
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      fullWidth
                      required
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        "& .MuiInputLabel-root": {
                          fontSize: isMobile ? "0.875rem" : "1rem",
                        },
                        "& .MuiInputBase-input": {
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
                      label="Email"
                      name="email"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      fullWidth
                      required
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={{
                        "& .MuiInputBase-input.Mui-readOnly": {
                          cursor: "not-allowed",
                          backgroundColor: "#f5f5f5",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: isMobile ? "0.875rem" : "1rem",
                        },
                        "& .MuiInputBase-input": {
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
                      label="School For"
                      name="schoolfor"
                      value={formik.values.schoolfor}
                      InputProps={{
                        readOnly: true,
                      }}
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        "& .MuiInputBase-input.Mui-readOnly": {
                          cursor: "not-allowed",
                          backgroundColor: "#f5f5f5",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: isMobile ? "0.875rem" : "1rem",
                        },
                        "& .MuiInputBase-input": {
                          fontSize: isMobile ? "0.875rem" : "1rem",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel
                        sx={{
                          fontSize: isMobile ? "0.875rem" : "1rem",
                        }}
                      >
                        School Level *
                      </InputLabel>
                      <Select
                        name="schoollevel"
                        value={formik.values.schoollevel}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.schoollevel && Boolean(formik.errors.schoollevel)}
                        label="School Level *"
                        sx={{
                          "& .MuiSelect-select": {
                            fontSize: isMobile ? "0.875rem" : "1rem",
                          },
                        }}
                      >
                        <MenuItem value="Primary">Primary</MenuItem>
                        <MenuItem value="Secondary">Secondary</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone Number *"
                      name="phoneNumber"
                      value={formik.values.phoneNumber}
                      onChange={handlePhoneNumberChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                      helperText={
                        formik.touched.phoneNumber &&
                        (formik.errors.phoneNumber ||
                          (formik.values.phoneNumber && `Entered: ${formik.values.phoneNumber.length} digits`))
                      }
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      inputProps={{
                        maxLength: 12,
                        inputMode: "numeric",
                      }}
                      sx={{
                        "& .MuiInputLabel-root": {
                          fontSize: isMobile ? "0.875rem" : "1rem",
                        },
                        "& .MuiInputBase-input": {
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
                      label="Established Year *"
                      name="establishedYear"
                      type="number"
                      value={formik.values.establishedYear}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.establishedYear && Boolean(formik.errors.establishedYear)}
                      helperText={formik.touched.establishedYear && formik.errors.establishedYear}
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      inputProps={{
                        min: 1947,
                        max: new Date().getFullYear(),
                      }}
                      sx={{
                        "& .MuiInputLabel-root": {
                          fontSize: isMobile ? "0.875rem" : "1rem",
                        },
                        "& .MuiInputBase-input": {
                          fontSize: isMobile ? "0.875rem" : "1rem",
                        },
                        "& .MuiFormHelperText-root": {
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Address *"
                      name="address"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.address && Boolean(formik.errors.address)}
                      helperText={formik.touched.address && formik.errors.address}
                      fullWidth
                      multiline
                      rows={isMobile ? 2 : 3}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        "& .MuiInputLabel-root": {
                          fontSize: isMobile ? "0.875rem" : "1rem",
                        },
                        "& .MuiInputBase-input": {
                          fontSize: isMobile ? "0.875rem" : "1rem",
                        },
                        "& .MuiFormHelperText-root": {
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                        },
                      }}
                    />
                  </Grid>

                  {/* Board Recognition Section */}
                  <Grid item xs={12}>
                    <Typography
                      variant={isMobile ? "subtitle1" : "h6"}
                      sx={{
                        fontWeight: 600,
                        mb: isMobile ? 1 : 2,
                        mt: isMobile ? 1 : 2,
                        fontSize: isMobile ? "1rem" : "1.25rem",
                        color: "#333",
                      }}
                    >
                      Board Recognition
                    </Typography>
                    <Divider sx={{ mb: isMobile ? 1.5 : 2 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Recognized by Board"
                      name="recognizedbyboard"
                      value={formik.values.recognizedbyboard}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.recognizedbyboard &&
                        (Boolean(formik.errors.recognizedbyboard) ||
                          (formik.values.boardattestationId && !formik.values.recognizedbyboard))
                      }
                      helperText={
                        formik.touched.recognizedbyboard &&
                        (formik.errors.recognizedbyboard ||
                          (formik.values.boardattestationId && !formik.values.recognizedbyboard
                            ? "Both fields are required when either is provided"
                            : ""))
                      }
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        "& .MuiInputLabel-root": {
                          fontSize: isMobile ? "0.875rem" : "1rem",
                        },
                        "& .MuiInputBase-input": {
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
                      label="Attestation ID"
                      name="boardattestationId"
                      value={formik.values.boardattestationId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.boardattestationId &&
                        (Boolean(formik.errors.boardattestationId) ||
                          (formik.values.recognizedbyboard && !formik.values.boardattestationId))
                      }
                      helperText={
                        formik.touched.boardattestationId &&
                        (formik.errors.boardattestationId ||
                          (formik.values.recognizedbyboard && !formik.values.boardattestationId
                            ? "Both fields are required when either is provided"
                            : ""))
                      }
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        "& .MuiInputLabel-root": {
                          fontSize: isMobile ? "0.875rem" : "1rem",
                        },
                        "& .MuiInputBase-input": {
                          fontSize: isMobile ? "0.875rem" : "1rem",
                        },
                        "& .MuiFormHelperText-root": {
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                        },
                      }}
                    />
                  </Grid>

                  {/* Facilities Section */}
                  <Grid item xs={12}>
                    <Typography
                      variant={isMobile ? "subtitle1" : "h6"}
                      sx={{
                        fontWeight: 600,
                        mb: isMobile ? 1 : 2,
                        mt: isMobile ? 1 : 2,
                        fontSize: isMobile ? "1rem" : "1.25rem",
                        color: "#333",
                      }}
                    >
                      Facilities
                    </Typography>
                    <Divider sx={{ mb: isMobile ? 1.5 : 2 }} />

                    <Grid container spacing={isMobile ? 0.5 : 1}>
                      {[
                        { name: "library", label: "Library" },
                        { name: "sports", label: "Sports Ground" },
                        { name: "computerLab", label: "Computer Lab" },
                        { name: "scienceLab", label: "Science Lab" },
                      ].map((facility) => (
                        <Grid item xs={12} sm={6} key={facility.name}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formik.values[facility.name]}
                                onChange={handleCheckboxChange}
                                name={facility.name}
                                size={isMobile ? "small" : "medium"}
                              />
                            }
                            label={
                              <Typography
                                sx={{
                                  fontSize: isMobile ? "0.875rem" : "1rem",
                                }}
                              >
                                {facility.label}
                              </Typography>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Button
                      onClick={handleSubmitClick}
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={loading.submit}
                      size={isMobile ? "medium" : "large"}
                      sx={{
                        mt: isMobile ? 2 : 3,
                        py: isMobile ? 1 : 1.5,
                        fontSize: isMobile ? "0.875rem" : "1rem",
                        fontWeight: 600,
                      }}
                    >
                      {loading.submit ? (
                        <>
                          <CircularProgress size={isMobile ? 16 : 20} sx={{ mr: 1 }} />
                          Updating...
                        </>
                      ) : (
                        "Update School"
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )
          )}
        </CardContent>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{
          vertical: isMobile ? "top" : "bottom",
          horizontal: "center",
        }}
        sx={{
          "& .MuiSnackbarContent-root": {
            maxWidth: isMobile ? "90vw" : "auto",
          },
        }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{
            fontSize: isMobile ? "0.875rem" : "1rem",
            maxWidth: isMobile ? "90vw" : "auto",
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            margin: isMobile ? 2 : 4,
            width: isMobile ? "calc(100% - 32px)" : "auto",
            maxHeight: isMobile ? "90vh" : "auto",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: isMobile ? "1.125rem" : "1.25rem",
            fontWeight: 600,
            pb: isMobile ? 1 : 2,
          }}
        >
          Confirm School Update
        </DialogTitle>
        <DialogContent
          sx={{
            py: isMobile ? 1 : 2,
          }}
        >
          <DialogContentText
            sx={{
              fontSize: isMobile ? "0.875rem" : "1rem",
              lineHeight: 1.6,
            }}
          >
            Are you sure you want to update details of this School?
            <br />
            <br />
            <strong>School ID:</strong> {formik.values.ID}
            <br />
            <strong>Email:</strong> {formik.values.email}
            <br />
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: isMobile ? "column-reverse" : "row",
            gap: isMobile ? 1 : 0,
            p: isMobile ? 2 : 1,
          }}
        >
          <Button
            onClick={() => setOpenConfirmDialog(false)}
            color="primary"
            fullWidth={isMobile}
            size={isMobile ? "medium" : "small"}
            sx={{
              fontSize: isMobile ? "0.875rem" : "0.875rem",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSubmit}
            color="primary"
            variant="contained"
            fullWidth={isMobile}
            size={isMobile ? "medium" : "small"}
            sx={{
              fontSize: isMobile ? "0.875rem" : "0.875rem",
              fontWeight: 600,
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EditSchool
