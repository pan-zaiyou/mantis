import React, { useCallback } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  Stack,
  TextField
} from "@mui/material";
import { PlusOutlined } from "@ant-design/icons";
import { useToggle } from "ahooks";
import { useTranslation } from "react-i18next";
import { Form, Formik } from "formik";
import { TicketLevel, TicketPayload } from "@/model/ticket";
import { FormikHelpers } from "formik/dist/types";
import { useSaveTicketMutation } from "@/store/services/api";
import { makeStyles } from "@/themes/hooks";
import { LoadingButton } from "@mui/lab";
import * as Yup from "yup";

const useStyles = makeStyles()((theme) => ({
  root: {
    padding: theme.spacing(2, 0),
    backgroundColor: "transparent"
  },
  nativeSelect: {
    width: "100%",
    padding: "16.5px 14px",
    fontSize: "1rem",
    fontFamily: "inherit",
    color: "inherit",
    backgroundColor: "transparent",
    border: "1px solid rgba(0, 0, 0, 0.23)",
    borderRadius: "4px",
    cursor: "pointer",
    outline: "none"
  }
}));

const CreateTicketButton: React.FC = () => {
  const { t } = useTranslation();
  const [open, { set: setOpen }] = useToggle(false);

  const [saveTicket] = useSaveTicketMutation();
  const { classes } = useStyles();

  const handleSubmit = useCallback(
    async (values: TicketPayload, { setSubmitting, setStatus, setErrors }: FormikHelpers<TicketPayload>) => {
      console.log(values);
      setSubmitting(true);
      try {
        await saveTicket(values).unwrap();
        setOpen(false);
        setStatus({ success: true });
      } catch (error: any) {
        console.error("error creating ticket", error);
        setStatus({ success: false });
        setErrors(error.errors || { submit: error.message });
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <PlusOutlined />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{t("ticket.drawer.create_dialog.title")}</DialogTitle>
        <Formik
          initialValues={
            {
              subject: "",
              message: "",
              level: TicketLevel.Low
            } as TicketPayload
          }
          validationSchema={Yup.object().shape({
            subject: Yup.string().required(
              t("ticket.drawer.create_dialog.subject", { context: "required" }).toString()
            ),
            message: Yup.string().required(
              t("ticket.drawer.create_dialog.message", { context: "required" }).toString()
            ),
            level: Yup.string().required(t("ticket.drawer.create_dialog.level", { context: "required" }).toString())
          })}
          onSubmit={handleSubmit}
        >
          {({
            handleSubmit,
            handleBlur,
            handleChange,
            values,
            touched,
            errors,
            submitForm,
            isSubmitting,
            resetForm
          }) => (
            <>
              <DialogContent>
                <Stack component={Form} onSubmit={handleSubmit} className={classes.root} spacing={2}>
                  <TextField
                    name={"subject"}
                    value={values.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.subject && Boolean(errors.subject)}
                    helperText={touched.subject && errors.subject}
                    label={t("ticket.drawer.create_dialog.subject", { context: "label" })}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel
                      htmlFor={"level-select"}
                      shrink
                      sx={{ background: "white", px: 0.5 }}
                    >
                      {t("ticket.drawer.create_dialog.level", { context: "label" })}
                    </InputLabel>
                    <select
                      id={"level-select"}
                      name={"level"}
                      value={values.level}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={classes.nativeSelect}
                      style={{
                        marginTop: "8px",
                        borderColor: touched.level && errors.level ? "#d32f2f" : "rgba(0, 0, 0, 0.23)"
                      }}
                    >
                      {[TicketLevel.Low, TicketLevel.Medium, TicketLevel.High].map((level) => (
                        <option value={level} key={level}>
                          {t("ticket.drawer.create_dialog.level", { context: level })}
                        </option>
                      ))}
                    </select>
                    {touched.level && errors.level && (
                      <FormHelperText error>
                        {errors.level}
                      </FormHelperText>
                    )}
                  </FormControl>
                  <TextField
                    name={"message"}
                    value={values.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.message && Boolean(errors.message)}
                    helperText={touched.message && errors.message}
                    label={t("ticket.drawer.create_dialog.message", { context: "label" })}
                    rows={4}
                    multiline
                    fullWidth
                  />
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button
                  type={"reset"}
                  disabled={isSubmitting}
                  onClick={() => {
                    resetForm();
                    setOpen(false);
                  }}
                >
                  {t("ticket.drawer.create_dialog.cancel", { context: "button" })}
                </Button>
                <LoadingButton loading={isSubmitting} onClick={submitForm} type={"submit"} variant={"contained"}>
                  {t("ticket.drawer.create_dialog.submit", { context: "button" })}
                </LoadingButton>
              </DialogActions>
            </>
          )}
        </Formik>
      </Dialog>
    </>
  );
};

export default CreateTicketButton;
