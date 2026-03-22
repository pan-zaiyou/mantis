import React, { useCallback, useMemo, useState, useEffect } from "react";

// material-ui
import {
  Button,
  Divider,
  Skeleton,
  Stack,
  Typography,
  Dialog,
  DialogContent,
  IconButton,
  Fade,
  Backdrop
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

// project
import MainCard from "@/components/MainCard";
import { useCheckoutOrderMutation } from "@/store/services/api";
import { useCheckoutContext } from "@/sections/order/checkoutPage/context";
import ReactGA from "react-ga4";

const BillingCard: React.FC = () => {
  const { t } = useTranslation();
  const {
    detail: { data: detailData, isLoading },
    paymentMethodState,
    paymentMethodIndex,
    setSubmitting,
    isSubmitting
  } = useCheckoutContext();

  const [checkoutOrder] = useCheckoutOrderMutation();
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [paid, setPaid] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);

  const isMobile = () =>
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // 🚀 支付检测
  useEffect(() => {
    if (!open || !detailData?.trade_no) return;

    const timer = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/v1/user/order/fetch?trade_no=${detailData.trade_no}`
        );
        const data = await res.json();

        if (data?.data?.status === 1) {
          setPaid(true);

          setTimeout(() => {
            setOpen(false);
            window.location.href = `/order/${detailData.trade_no}`;
          }, 800);
        }
      } catch (err) {}
    }, 1000);

    return () => clearInterval(timer);
  }, [open, detailData]);

  const handleClick = useCallback(async () => {
    if (!detailData || !paymentMethodState) return;

    try {
      setSubmitting(true);

      setOpen(true);        // 🍎 立即打开
      setLoadingQr(true);

      const res = await checkoutOrder({
        trade_no: detailData.trade_no,
        method: paymentMethodState
      }).unwrap();

      if (typeof res === "string") {
        if (isMobile()) {
          window.location.href = res;
        } else {
          setQrCodeUrl(res);
        }
      }

      setLoadingQr(false);
    } catch (err) {
      enqueueSnackbar("支付失败", { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }, [detailData, paymentMethodState]);

  const price = ((detailData?.total_amount ?? 0) / 100).toFixed(2);

  return (
    <>
      <MainCard title={t("order.checkout.billing-card.title")}>
        <Stack spacing={2} divider={<Divider />}>
          {isLoading ? (
            <Skeleton height={40} />
          ) : (
            <Stack direction="row" justifyContent="space-between">
              <Typography>{detailData?.plan?.name}</Typography>
              <Typography>¥{price}</Typography>
            </Stack>
          )}

          <Button
            fullWidth
            variant="contained"
            disabled={isSubmitting}
            onClick={handleClick}
          >
            立即支付
          </Button>
        </Stack>
      </MainCard>

      {/* 🍎 Apple风弹窗 */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        BackdropComponent={Backdrop}
        BackdropProps={{
          sx: {
            backdropFilter: "blur(12px)",
            backgroundColor: "rgba(0,0,0,0.25)"
          }
        }}
      >
        <Fade in={open}>
          <DialogContent
            sx={{
              width: 300,
              borderRadius: "20px",
              textAlign: "center",
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              position: "relative",
              p: 3
            }}
          >
            {/* 关闭 */}
            <IconButton
              onClick={() => setOpen(false)}
              sx={{
                position: "absolute",
                right: 10,
                top: 10,
                opacity: 0.6
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            {paid ? (
              <Stack alignItems="center" spacing={2}>
                <CheckCircleIcon
                  sx={{ fontSize: 60, color: "#34c759" }}
                />
                <Typography sx={{ fontWeight: 600 }}>
                  支付成功
                </Typography>
              </Stack>
            ) : (
              <>
                <Typography sx={{ fontSize: 26, fontWeight: 600 }}>
                  ¥{price}
                </Typography>

                <Typography sx={{ fontSize: 12, color: "#888", mb: 2 }}>
                  {detailData?.plan?.name}
                </Typography>

                {/* 🍎 二维码 / 骨架 */}
                <div
                  style={{
                    width: 180,
                    height: 180,
                    margin: "0 auto",
                    borderRadius: 12,
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
                  }}
                >
                  {loadingQr ? (
                    <Typography sx={{ fontSize: 12, color: "#aaa" }}>
                      加载中...
                    </Typography>
                  ) : (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        qrCodeUrl
                      )}`}
                      style={{ width: 160 }}
                    />
                  )}
                </div>

                <Typography sx={{ mt: 2, fontSize: 13 }}>
                  使用支付宝扫码
                </Typography>

                {/* 🍎 小按钮 */}
                <Button
                  onClick={() => setOpen(false)}
                  sx={{
                    mt: 2,
                    fontSize: 12,
                    color: "#666"
                  }}
                >
                  取消
                </Button>
              </>
            )}
          </DialogContent>
        </Fade>
      </Dialog>
    </>
  );
};

export default BillingCard;
