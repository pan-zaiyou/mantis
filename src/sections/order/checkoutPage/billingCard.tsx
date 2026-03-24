import React, { useCallback, useMemo, useState, useEffect } from "react";

// third-party
import { useTranslation } from "react-i18next";

// material-ui
import {
  Button,
  Divider,
  Skeleton,
  Stack,
  Typography,
  Dialog,
  DialogContent,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbar } from "notistack";

// project imports
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

  // ⏱ 倒计时
  const [timeLeft, setTimeLeft] = useState(300);

  // 💰 支付状态
  const [payStatus, setPayStatus] = useState<"pending" | "success">("pending");

  const isMobile = () =>
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // ⏱ 倒计时逻辑
  useEffect(() => {
    if (!open) return;

    setTimeLeft(300);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  const formatTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

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
          setPayStatus("success");

          setTimeout(() => {
            setOpen(false);
            window.location.href = `/order/${detailData.trade_no}`;
          }, 1200);
        }
      } catch (err) {
        console.error("检测支付状态失败", err);
      }
    };

    check();
    const timer = setInterval(check, 1200);
    return () => clearInterval(timer);
  }, [open, detailData]);

  // ⏱ 过期自动刷新二维码
  useEffect(() => {
    if (timeLeft === 0 && detailData && paymentMethodState) {
      handleClick(new Event("refresh") as any);
    }
  }, [timeLeft]);

  const lines = useMemo(
    () => [
      {
        label:
          detailData?.plan.name === "deposit"
            ? t("order.checkout.product-info-card.deposit")
            : detailData?.plan.name,
        value: t("order.checkout.billing-card.price", {
          value: Number(
            (detailData?.total_amount ?? 0) / 100
          ).toFixed(2)
        })
      },
      ...(detailData?.discount_amount || detailData?.surplus_amount
        ? [
            {
              label: t("order.checkout.billing-card.deduction"),
              value: t("order.checkout.billing-card.price", {
                value: (
                  ((detailData?.discount_amount ?? 0) +
                    (detailData?.surplus_amount ?? 0)) /
                  -100
                ).toFixed(2)
              })
            }
          ]
        : []),
      {
        label: t("order.checkout.billing-card.total-price"),
        value: t("order.checkout.billing-card.price", {
          value: Number(
            (detailData?.total_amount ?? 0) / 100
          ).toFixed(2)
        })
      }
    ],
    [detailData, t]
  );

  const handleClick = useCallback(
    async (e: any) => {
      e?.preventDefault?.();

      if (detailData && paymentMethodState) {
        try {
          setSubmitting(true);
          setPayStatus("pending");

          ReactGA.event("click", {
            category: "order",
            label: "checkout",
            method: paymentMethodIndex.get(paymentMethodState)?.name,
            method_id: paymentMethodState
          });

          const res = await checkoutOrder({
            trade_no: detailData.trade_no,
            method: paymentMethodState
          }).unwrap();

          if (typeof res === "string") {
            if (isMobile()) {
              window.location.href = res;
            } else {
              setQrCodeUrl(res);
              setOpen(true);
            }
          } else if (res?.type === "qrcode") {
            setQrCodeUrl(res.data);
            setOpen(true);
          } else {
            window.location.href = res?.data || "/";
          }
        } catch (err) {
          enqueueSnackbar(t("notice::checkout-failed"), {
            variant: "error"
          });
        } finally {
          setSubmitting(false);
        }
      }
    },
    [checkoutOrder, detailData, paymentMethodState]
  );

  return (
    <>
      <MainCard title={t("order.checkout.billing-card.title")}>
        <Stack spacing={2} divider={<Divider />}>
          {lines.map((line, index) =>
            isLoading ? (
              <Skeleton key={index} variant="text" height={40} />
            ) : (
              <Stack
                direction="row"
                justifyContent="space-between"
                key={index}
              >
                <Typography>{line.label}</Typography>
                <Typography fontWeight={800}>{line.value}</Typography>
              </Stack>
            )
          )}

          <Button
            fullWidth
            variant="contained"
            disabled={isLoading || isSubmitting}
            onClick={handleClick}
          >
            {t("order.checkout.billing-card.button")}
          </Button>
        </Stack>
      </MainCard>

      {/* 💎 终极支付弹窗 */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        PaperProps={{
          style: {
            width: 360,
            borderRadius: 14,
            background: "#f6f7fb"
          }
        }}
      >
        <DialogContent
          style={{
            padding: "20px 18px 24px",
            textAlign: "center",
            position: "relative"
          }}
        >
          <IconButton
            onClick={() => setOpen(false)}
            style={{ position: "absolute", right: 10, top: 10 }}
          >
            <CloseIcon />
          </IconButton>

          {payStatus === "success" ? (
            <>
              <Typography sx={{ fontSize: 20, fontWeight: 700, mt: 2 }}>
                支付成功
              </Typography>

              <Typography sx={{ fontSize: 60, color: "#22c55e", mt: 2 }}>
                ✔
              </Typography>

              <Typography sx={{ mt: 2, color: "#666" }}>
                正在跳转订单页面...
              </Typography>
            </>
          ) : (
            <>
              <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
                扫码支付
              </Typography>

              <Typography
                sx={{
                  fontSize: 50,
                  fontWeight: 900,
                  mt: 2
                }}
              >
                ¥{((detailData?.total_amount ?? 0) / 100).toFixed(2)}
              </Typography>

              <Typography sx={{ color: "#888", mb: 2 }}>
                {detailData?.plan?.name}
              </Typography>

              {qrCodeUrl && (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    padding: 14,
                    display: "inline-block",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.08)"
                  }}
                >
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                      qrCodeUrl
                    )}`}
                    style={{ width: 200, height: 200 }}
                  />
                </div>
              )}

              <Typography sx={{ mt: 2 }}>
                请使用支付宝扫码支付
              </Typography>

              <Typography sx={{ fontSize: 13, color: "#999", mt: 1 }}>
                订单号：{detailData?.trade_no}
              </Typography>

              <Typography sx={{ fontSize: 13, color: "#999" }}>
                支付金额：¥{((detailData?.total_amount ?? 0) / 100).toFixed(2)}
              </Typography>

              <Typography
                sx={{
                  color: "#ff4d4f",
                  fontWeight: 600,
                  mt: 1
                }}
              >
                请在 {formatTime(timeLeft)} 内完成支付
              </Typography>

              <Typography sx={{ color: "#22c55e", mt: 1 }}>
                安全支付保障中
              </Typography>

              <Button
                fullWidth
                sx={{
                  mt: 3,
                  height: 44,
                  borderRadius: 2,
                  background: "#e5e7eb"
                }}
                onClick={() => setOpen(false)}
              >
                取消支付
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BillingCard;
