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

  // 支付状态检测
  useEffect(() => {
    if (!open || !detailData?.trade_no) return;

    const check = async () => {
      try {
        const res = await fetch(
          `/api/v1/user/order/fetch?trade_no=${detailData.trade_no}`
        );
        const data = await res.json();

        if (data?.data?.status === 1) {
          setOpen(false);
          enqueueSnackbar("支付成功 🎉", { variant: "success" });

          setTimeout(() => {
            window.location.href = `/order/${detailData.trade_no}`;
          }, 800);
        }
      } catch (err) {
        console.error("检测支付状态失败", err);
      }
    };

    check();
    const timer = setInterval(check, 1000);
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
              <Skeleton key={index} variant="text" height={40} />
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

      {/* 支付弹窗 */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        PaperProps={{
          style: {
            width: 340,
            borderRadius: 16,
            backdropFilter: "blur(10px)",
            background: "rgba(255, 255, 255, 0.95)"
          }
        }}
      >
        <DialogContent
          style={{
            padding: "24px 20px",
            textAlign: "center",
            position: "relative"
          }}
        >
          {/* 顶部 Logo */}
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <img
              src="/path/to/top-logo.png" // 替换为你的实际 logo
              style={{
                width: 80,
                height: 24,
                objectFit: "contain"
              }}
              alt="Logo"
            />
          </div>

          {/* 关闭按钮 */}
          <IconButton
            onClick={() => setOpen(false)}
            style={{ position: "absolute", right: 10, top: 10 }}
          >
            <CloseIcon />
          </IconButton>

          {/* 扫码支付标题 */}
          <Typography sx={{ fontSize: 13, color: "#999", mb: 1 }}>
            扫码支付
          </Typography>

          {/* 金额（加粗） */}
          <Typography sx={{ fontSize: 28, fontWeight: "bold", color: "#111" }}>
            ¥{((detailData?.total_amount ?? 0) / 100).toFixed(2)}
          </Typography>

          {/* 套餐名称 */}
          <Typography sx={{ fontSize: 12, color: "#aaa", mb: 2.5 }}>
            {detailData?.plan?.name}
          </Typography>

          {/* 二维码 */}
          <div
            style={{
              background: "#fafafa",
              borderRadius: 16,
              padding: 14,
              display: "inline-block",
              border: "1px solid #f0f0f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                qrCodeUrl
              )}`}
              style={{
                width: 180,
                height: 180,
                display: "block"
              }}
            />
          </div>

          {/* 提示文字 */}
          <Stack spacing={0.75} sx={{ mt: 2 }}>
            <Typography sx={{ fontSize: 13, color: "#333" }}>
              请使用支付宝扫码完成支付
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#52c41a" }}>
              支付完成后将自动跳转...
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#bbb" }}>
              关闭后可在订单列表继续支付
            </Typography>
          </Stack>

          {/* 取消支付按钮 */}
          <Button
            variant="contained"
            color="error"
            sx={{
              mt: 3,
              height: 38,
              minWidth: 140,
              paddingX: 3,
              borderRadius: 2,
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "#d32f2f"
              }
            }}
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
