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

  const isMobile = () =>
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // ✅ 自动检测支付状态
  useEffect(() => {
    if (!open || !detailData?.trade_no) return;

    const timer = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/v1/user/order/fetch?trade_no=${detailData.trade_no}`
        );
        const data = await res.json();

        if (data?.data?.status === 1) {
          setOpen(false);

          enqueueSnackbar("支付成功 🎉", {
            variant: "success"
          });

          setTimeout(() => {
            window.location.href = `/order/${detailData.trade_no}`;
          }, 1000);
        }
      } catch (err) {
        console.error("检测支付状态失败", err);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [open, detailData]);

  const lines = useMemo(
    () => [
      {
        label:
          detailData?.plan.name === "deposit"
            ? t("order.checkout.product-info-card.deposit")
            : detailData?.plan.name,
        value: t("order.checkout.billing-card.price", {
          value: Number((detailData?.total_amount ?? 0) / 100).toFixed(2)
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
          value: Number((detailData?.total_amount ?? 0) / 100).toFixed(2)
        })
      }
    ],
    [detailData, t]
  );

  const handleClick = useCallback(
    async (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();

      if (detailData && paymentMethodState) {
        try {
          setSubmitting(true);

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
          console.error(err);
          enqueueSnackbar(t("notice::checkout-failed"), {
            variant: "error"
          });
        } finally {
          setSubmitting(false);
        }
      } else {
        enqueueSnackbar(t("notice::data-not-loaded"), {
          variant: "error"
        });
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
              <Skeleton key={index} variant="text" width="100%" height={40} />
            ) : (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                key={index}
              >
                <Typography>{line.label}</Typography>
                <Typography>{line.value}</Typography>
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

      {/* 💎 极简高级支付弹窗 */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent
          style={{
            padding: "28px 24px",
            background: "#ffffff",
            borderRadius: 12,
            position: "relative",
            textAlign: "center"
          }}
        >
          {/* 关闭 */}
          <IconButton
            onClick={() => setOpen(false)}
            style={{
              position: "absolute",
              right: 12,
              top: 12
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* 标题 */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            扫码支付
          </Typography>

          {/* 金额 */}
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", mb: 1, color: "#111" }}
          >
            ¥{((detailData?.total_amount ?? 0) / 100).toFixed(2)}
          </Typography>

          {/* 套餐 */}
          <Typography variant="body2" sx={{ color: "#888", mb: 3 }}>
            {detailData?.plan?.name}
          </Typography>

          {/* 二维码 */}
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: "#f7f7f7",
              display: "inline-block"
            }}
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                qrCodeUrl
              )}`}
              style={{
                width: 200,
                height: 200
              }}
            />
          </div>

          {/* 提示 */}
          <Typography sx={{ mt: 2, fontSize: 14, color: "#555" }}>
            请使用支付宝扫码完成支付
          </Typography>

          {/* 状态 */}
          <Typography sx={{ mt: 1, fontSize: 12, color: "#999" }}>
            支付完成后将自动跳转
          </Typography>

          {/* 按钮 */}
          <Button
            fullWidth
            variant="outlined"
            sx={{
              mt: 3,
              borderRadius: 2,
              height: 42
            }}
            onClick={() => setOpen(false)}
          >
            取消
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BillingCard;
