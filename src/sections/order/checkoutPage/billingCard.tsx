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
  Backdrop,
  Box
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

// project
import MainCard from "@/components/MainCard";
import { useCheckoutOrderMutation } from "@/store/services/api";
import { useCheckoutContext } from "@/sections/order/checkoutPage/context";

const BillingCard: React.FC = () => {
  const { t } = useTranslation();
  const {
    detail: { data: detailData, isLoading },
    paymentMethodState,
    setSubmitting,
    isSubmitting
  } = useCheckoutContext();

  const [checkoutOrder] = useCheckoutOrderMutation();
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [paid, setPaid] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);

  // ⏳ 倒计时（10分钟）
  const [countdown, setCountdown] = useState(600);

  const isMobile = () =>
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // 🚀 支付状态检测
  useEffect(() => {
    if (!open || !detailData?.trade_no) return;

    const check = async () => {
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
          }, 700);
        }
      } catch {}
    };

    check();
    const timer = setInterval(check, 1000);

    return () => clearInterval(timer);
  }, [open, detailData]);

  // ⏳ 倒计时逻辑
  useEffect(() => {
    if (!open) return;

    setCountdown(600);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setOpen(false);
          enqueueSnackbar("订单已过期", { variant: "warning" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleClick = useCallback(async () => {
    if (!detailData || !paymentMethodState) return;

    try {
      setSubmitting(true);

      setOpen(true);
      setLoadingQr(true);
      setPaid(false);

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
      } else if (res?.type === "qrcode") {
        setQrCodeUrl(res.data);
      }

      setLoadingQr(false);
    } catch {
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

      {/* 🍎 Apple风 + 暗黑 + 3D */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        BackdropComponent={Backdrop}
        BackdropProps={{
          sx: {
            backdropFilter: "blur(14px)",
            backgroundColor: "rgba(0,0,0,0.25)"
          }
        }}
      >
        <Fade in={open}>
          <DialogContent
            sx={(theme) => ({
              width: 300,
              borderRadius: "22px",
              textAlign: "center",
              background:
                theme.palette.mode === "dark"
                  ? "rgba(30,30,30,0.65)"
                  : "rgba(255,255,255,0.65)",
              backdropFilter: "blur(30px)",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 10px 40px rgba(0,0,0,0.6)"
                  : "0 10px 30px rgba(0,0,0,0.1)",
              p: 3,
              position: "relative"
            })}
          >
            {!paid && (
              <IconButton
                onClick={() => setOpen(false)}
                sx={{ position: "absolute", right: 10, top: 10 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}

            {paid ? (
              <Stack alignItems="center" spacing={2}>
                <CheckCircleIcon sx={{ fontSize: 60, color: "#34c759" }} />
                <Typography>支付成功</Typography>
              </Stack>
            ) : (
              <>
                <Typography sx={{ fontSize: 26, fontWeight: 600 }}>
                  ¥{price}
                </Typography>

                <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 2 }}>
                  {detailData?.plan?.name}
                </Typography>

                <Box
                  sx={(theme) => ({
                    width: 180,
                    height: 180,
                    mx: "auto",
                    borderRadius: 2,
                    background:
                      theme.palette.mode === "dark"
                        ? "linear-gradient(145deg, #2a2a2a, #1f1f1f)"
                        : "linear-gradient(145deg, #ffffff, #f3f3f3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "0 8px 25px rgba(0,0,0,0.5)"
                        : "0 8px 20px rgba(0,0,0,0.08)"
                  })}
                >
                  {loadingQr ? (
                    <Typography sx={{ fontSize: 12 }}>加载中...</Typography>
                  ) : (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        qrCodeUrl
                      )}`}
                      style={{ width: 150 }}
                    />
                  )}
                </Box>

                <Typography sx={{ mt: 1.5, fontSize: 13 }}>
                  请使用支付宝扫码
                </Typography>

                {/* 🧾 订单号 */}
                <Typography sx={{ mt: 1.5, fontSize: 12, color: "text.secondary" }}>
                  订单号：{detailData?.trade_no}
                </Typography>

                {/* ⏳ 倒计时 */}
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 12,
                    color: countdown < 60 ? "#ff4d4f" : "text.secondary"
                  }}
                >
                  剩余时间：{formatTime(countdown)}
                </Typography>

                <Button
                  onClick={() => setOpen(false)}
                  sx={{ mt: 2, fontSize: 12 }}
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
