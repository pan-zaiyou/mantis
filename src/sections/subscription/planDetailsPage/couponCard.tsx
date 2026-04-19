import React, { useEffect } from "react";
import { Formik } from "formik";
import { useTranslation } from "react-i18next";

// material-ui
import { Box, Button, FormHelperText, OutlinedInput } from "@mui/material";

// project imports
import MainCard from "@/components/MainCard";
import { useCheckCouponMutation } from "@/store/services/api";
import { usePlanDetailContext } from "@/sections/subscription/planDetailsPage/context";

// assets
import { GiftOutlined } from "@ant-design/icons";

const CouponCard: React.FC = () => {
  const { t } = useTranslation();
  const [checkCoupon, { isLoading }] = useCheckCouponMutation();
  const { setIsSubmitting, isSubmitting, id, setCouponCode, couponCode } = usePlanDetailContext();

  useEffect(() => {
    setIsSubmitting(isLoading);
  }, [isLoading, setIsSubmitting]);

  return (
    <MainCard
      title={
        <Box display="flex" alignItems="center" gap={1}>
          <GiftOutlined style={{ color: "#1677ff" }} />
          {t("subscription.plan.coupon-card.title")}
        </Box>
      }
    >
      <Formik
        initialValues={{
          coupon: couponCode?.code || ""
        }}
        onSubmit={async (values, { setSubmitting, setStatus, setErrors, setValues }) => {
          if (couponCode) {
            setValues({ coupon: "" });
            setCouponCode(null);
            return;
          }

          setSubmitting(true);
          await checkCoupon({ code: values.coupon, plan_id: id })
            .unwrap()
            .then((res) => {
              setCouponCode(res);
              setSubmitting(false);
              setStatus({ success: true });
            })
            .catch((err) => {
              setSubmitting(false);
              setStatus({ success: false });
              setErrors(err.errors || { coupon: err.message });
            });
        }}
      >
        {({ values, handleChange, handleSubmit, handleBlur, errors, touched }) => (
          <Box component={"form"} onSubmit={handleSubmit}>
            <Box display="flex" gap={1}>
              <OutlinedInput
                fullWidth
                name={"coupon"}
                placeholder={t("subscription.plan.coupon-card.placeholder").toString()}
                disabled={isSubmitting || couponCode !== null}
                onChange={handleChange}
                onBlur={handleBlur}
                value={couponCode !== null ? couponCode.code : values.coupon}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              />
              <Button
                variant="outlined"
                type="submit"
                disabled={isSubmitting}
                sx={{
                  whiteSpace: "nowrap",
                  transition: "none",
                  "&:active": { filter: "brightness(0.75)" }
                }}
              >
                {couponCode !== null ? "重置" : "验证"}
              </Button>
            </Box>
            {touched.coupon && errors.coupon && (
              <FormHelperText error>{errors.coupon}</FormHelperText>
            )}
          </Box>
        )}
      </Formik>
    </MainCard>
  );
};

export default CouponCard;
