import { useState } from "react";
import { useNavigate } from "react-router-dom";

// material-ui
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  FormHelperText,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

// third party
import * as Yup from "yup";
import { Formik } from "formik";

// project import
import AnimateButton from "components/@extended/AnimateButton";
import useScriptRef from "hooks/useScriptRef";
import { enqueueSnackbar } from "notistack";

// api
import { useRegisterMutation } from "store/services/auth";

// ============================|| REGISTER ||============================ //

export default function AuthRegister() {
  const theme = useTheme();
  const scriptedRef = useScriptRef();
  const navigate = useNavigate();

  const [register] = useRegisterMutation();
  const [tempValues, setTempValues] = useState<any>(null);

  return (
    <>
      <Formik
        initialValues={{
          email: "",
          password: "",
          password_confirmation: "",
          submit: null,
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email("邮箱格式错误").max(255).required("请输入邮箱"),
          password: Yup.string().max(255).required("请输入密码"),
          password_confirmation: Yup.string()
            .oneOf([Yup.ref("password")], "两次密码不一致")
            .required("请确认密码"),
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            setTempValues(values);

            await register({
              email: values.email,
              password: values.password,
              password_confirmation: values.password_confirmation,
            }).unwrap();

            // 成功逻辑（保持你原有）
            enqueueSnackbar("注册成功", { variant: "success" });
            navigate("/login", { replace: true });

          } catch (error: any) {
            if (scriptedRef.current) {
              setTempValues(null);

              // ✅ 核心修复（只改这里）
              const msg =
                error?.data?.message ||
                error?.error ||
                error?.message ||
                "注册失败";

              enqueueSnackbar(msg, { variant: "error" });

              setStatus({ success: false });
              setErrors({ submit: msg });
              setSubmitting(false);

              console.error("register error:", error);
            }
          }
        }}
      >
        {({
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          touched,
          values,
        }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <Typography variant="subtitle1">邮箱</Typography>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    value={values.email}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="请输入邮箱"
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <Typography variant="subtitle1">密码</Typography>
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    type="password"
                    value={values.password}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="请输入密码"
                    error={Boolean(touched.password && errors.password)}
                    helperText={touched.password && errors.password}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <Typography variant="subtitle1">确认密码</Typography>
                  <TextField
                    fullWidth
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    value={values.password_confirmation}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="请再次输入密码"
                    error={Boolean(
                      touched.password_confirmation &&
                        errors.password_confirmation
                    )}
                    helperText={
                      touched.password_confirmation &&
                      errors.password_confirmation
                    }
                  />
                </Stack>
              </Grid>

              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}

              <Grid item xs={12}>
                <AnimateButton>
                  <Button
                    disableElevation
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    注册
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}
