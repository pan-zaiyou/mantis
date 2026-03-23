import React, { useCallback, useMemo, useState, useEffect } from "react";

// third-party
import { useTranslation } from "react-i18next";
import QRCode from "qrcode.react";

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
  Zoom
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
  const [paid, setPaid] = useState(false);

  const isMobile = () =>
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // 🚀 支付检测
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

          enqueueSnackbar("支付成功 🎉", {
            variant: "success"
          });

          setTimeout(() => {
            setOpen(false);
            window.location.href = `/order/${detailData.trade_no}`;
          }, 800);
        }
      } catch {}
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
              setPaid(false);
            }
          } else if (res?.type === "qrcode") {
            setQrCodeUrl(res.data);
            setOpen(true);
            setPaid(false);
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
              <Skeleton key={index} height={40} />
            ) : (
              <Stack key={index} direction="row" justifyContent="space-between">
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

      {/* 💎 弹窗 */}
      <Dialog open={open} maxWidth="xs">
        <DialogContent
          style={{
            width: 340,
            padding: 24,
            textAlign: "center",
            position: "relative"
          }}
        >
          {!paid && (
            <IconButton
              onClick={() => setOpen(false)}
              style={{ position: "absolute", right: 10, top: 10 }}
            >
              <CloseIcon />
            </IconButton>
          )}

          {paid ? (
            <Fade in={paid}>
              <Stack alignItems="center" spacing={2}>
                <Zoom in={paid}>
                  <CheckCircleIcon
                    style={{ fontSize: 64, color: "#52c41a" }}
                  />
                </Zoom>

                <Typography sx={{ fontSize: 20, fontWeight: 600 }}>
                  支付成功
                </Typography>
              </Stack>
            </Fade>
          ) : (
            <>
              <Typography sx={{ fontSize: 28, fontWeight: 600 }}>
                ¥{((detailData?.total_amount ?? 0) / 100).toFixed(2)}
              </Typography>

              <Typography sx={{ fontSize: 12, color: "#aaa", mb: 2 }}>
                {detailData?.plan?.name}
              </Typography>

              {/* 🚀 本地二维码（秒加载） */}
              <Fade in={!!qrCodeUrl}>
                <div>
                  <QRCode
                    value={qrCodeUrl}
                    size={180}
                    style={{
                      borderRadius: 10
                    }}
                  />
                </div>
              </Fade>

              <Stack spacing={0.5} sx={{ mt: 2 }}>
                <Typography sx={{ fontSize: 13 }}>
                  请使用支付宝扫码支付
                </Typography>
              </Stack>

              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 3 }}
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
