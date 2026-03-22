import React, { useCallback, useMemo, useState } from "react";

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

      {/* 🎨 UI升级版弹窗 */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent
          style={{
            textAlign: "center",
            padding: "30px 20px",
            position: "relative"
          }}
        >
          {/* ❌ 关闭按钮 */}
          <IconButton
            onClick={() => setOpen(false)}
            style={{
              position: "absolute",
              right: 10,
              top: 10
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* 标题 */}
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            支付宝扫码支付
          </Typography>

          {/* 金额 */}
          <Typography
            variant="h4"
            sx={{ mb: 2, fontWeight: "bold", color: "#1677ff" }}
          >
            ¥{((detailData?.total_amount ?? 0) / 100).toFixed(2)}
          </Typography>

          {/* 套餐 */}
          <Typography variant="body2" sx={{ mb: 2, color: "#888" }}>
            {detailData?.plan?.name}
          </Typography>

          {/* 二维码卡片 */}
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: "#fff",
              display: "inline-block",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
            }}
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                qrCodeUrl
              )}`}
              style={{
                width: 220,
                height: 220,
                display: "block"
              }}
            />
          </div>

          {/* 提示 */}
          <Typography
            variant="body2"
            sx={{ mt: 2, color: "#666", lineHeight: 1.6 }}
          >
            请使用支付宝扫码支付
            <br />
            支付完成后自动开通服务
          </Typography>

          {/* 取消按钮 */}
          <Button
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
            onClick={() => setOpen(false)}
          >
            取消支付
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BillingCard;
