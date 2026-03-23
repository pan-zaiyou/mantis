import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
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
  Zoom,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useSnackbar } from "notistack";
import ReactGA from "react-ga4";

// project imports
import MainCard from "@/components/MainCard";
import { useCheckoutOrderMutation } from "@/store/services/api";
import { useCheckoutContext } from "@/sections/order/checkoutPage/context";

// 🚀 静态工具函数：移出组件避免重复定义
const isMobileDevice = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const formatAmount = (amount: number) => (Number(amount ?? 0) / 100).toFixed(2);

const BillingCard: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const {
    detail: { data: detailData, isLoading },
    paymentMethodState,
    paymentMethodIndex,
    setSubmitting,
    isSubmitting,
  } = useCheckoutContext();

  const [checkoutOrder] = useCheckoutOrderMutation();

  // 状态管理
  const [open, setOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [paid, setPaid] = useState(false);
  
  // 使用 ref 记录定时器，确保清理更彻底
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 🛑 清理定时器的函数
  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 🚀 支付检测逻辑
  useEffect(() => {
    // 仅在弹窗打开、有交易号、且未支付成功时开启轮询
    if (!open || !detailData?.trade_no || paid) {
      stopPolling();
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/v1/user/order/fetch?trade_no=${detailData.trade_no}`);
        if (!res.ok) return; // 忽略网络临时错误
        
        const result = await res.json();
        if (result?.data?.status === 1) {
          stopPolling(); // 立即停止轮询
          setPaid(true);
          enqueueSnackbar(t("支付成功 🎉"), { variant: "success" });

          // 动画展示后跳转
          setTimeout(() => {
            setOpen(false);
            window.location.href = `/order/${detailData.trade_no}`;
          }, 1200);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    // 立即执行一次检查，然后开始间隔轮询
    checkStatus();
    timerRef.current = setInterval(checkStatus, 2000); // 间隔设为2s，平衡实时性与性能

    return () => stopPolling();
  }, [open, detailData?.trade_no, paid, stopPolling, enqueueSnackbar, t]);

  // 💰 费用明细计算
  const lines = useMemo(() => {
    const total = formatAmount(detailData?.total_amount || 0);
    const isDeposit = detailData?.plan.name === "deposit";
    
    const items = [
      {
        label: isDeposit ? t("order.checkout.product-info-card.deposit") : detailData?.plan.name,
        value: t("order.checkout.billing-card.price", { value: total }),
      },
    ];

    if (detailData?.discount_amount || detailData?.surplus_amount) {
      const deduction = ((detailData.discount_amount ?? 0) + (detailData.surplus_amount ?? 0)) / -100;
      items.push({
        label: t("order.checkout.billing-card.deduction"),
        value: t("order.checkout.billing-card.price", { value: deduction.toFixed(2) }),
      });
    }

    items.push({
      label: t("order.checkout.billing-card.total-price"),
      value: t("order.checkout.billing-card.price", { value: total }),
    });

    return items;
  }, [detailData, t]);

  // 🖱️ 点击支付处理
  const handlePaymentClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!detailData || !paymentMethodState) {
      enqueueSnackbar(t("notice::data-not-loaded"), { variant: "error" });
      return;
    }

    try {
      setSubmitting(true);
      
      // Google Analytics
      ReactGA.event("click", {
        category: "order",
        label: "checkout",
        method: paymentMethodIndex.get(paymentMethodState)?.name,
        method_id: paymentMethodState
      });

      const res = await checkoutOrder({
        trade_no: detailData.trade_no,
        method: paymentMethodState,
      }).unwrap();

      // 这里的逻辑做了兼容处理
      const payUrl = typeof res === "string" ? res : (res?.data || res?.url);

      if (isMobileDevice()) {
        window.location.href = payUrl;
      } else {
        // PC端：如果是二维码地址或类型
        setQrCodeUrl(payUrl);
        setPaid(false);
        setOpen(true);
      }
    } catch (err) {
      console.error(err);
      enqueueSnackbar(t("notice::checkout-failed"), { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }, [checkoutOrder, detailData, paymentMethodState, paymentMethodIndex, setSubmitting, enqueueSnackbar, t]);

  return (
    <>
      <MainCard title={t("order.checkout.billing-card.title")}>
        <Stack spacing={2} divider={<Divider />}>
          {lines.map((line, index) =>
            isLoading ? (
              <Skeleton key={index} variant="text" width="100%" height={40} />
            ) : (
              <Stack direction="row" justifyContent="space-between" key={index}>
                <Typography>{line.label}</Typography>
                <Typography fontWeight="600">{line.value}</Typography>
              </Stack>
            )
          )}
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading || isSubmitting}
            onClick={handlePaymentClick}
          >
            {isSubmitting ? t("正在跳转...") : t("order.checkout.billing-card.button")}
          </Button>
        </Stack>
      </MainCard>

      {/* 💎 支付弹窗 */}
      <Dialog 
        open={open} 
        maxWidth="xs"
        disableEscapeKeyDown={paid} // 支付成功后禁止通过Esc关闭
        onClose={(_, reason) => {
          // 支付中允许关闭，支付成功后自动跳转
          if (!paid) setOpen(false);
        }}
      >
        <DialogContent sx={{ width: 340, p: 4, textAlign: "center", position: "relative" }}>
          {!paid && (
            <IconButton
              onClick={() => setOpen(false)}
              sx={{ position: "absolute", right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
            >
              <CloseIcon />
            </IconButton>
          )}

          {paid ? (
            <Fade in={paid}>
              <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
                <Zoom in={paid} style={{ transitionDelay: '100ms' }}>
                  <CheckCircleIcon sx={{ fontSize: 72, color: "#52c41a" }} />
                </Zoom>
                <Typography variant="h5" fontWeight="600">
                  支付成功
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  正在为您开通服务，请稍后...
                </Typography>
              </Stack>
            </Fade>
          ) : (
            <>
              <Typography variant="h4" fontWeight="700" sx={{ mb: 0.5 }}>
                ¥{formatAmount(detailData?.total_amount || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {detailData?.plan?.name}
              </Typography>
              
              <Box sx={{ bgcolor: '#f9f9f9', p: 2, borderRadius: 2, display: 'inline-block' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                  style={{ width: 180, height: 180, display: 'block' }}
                  alt="Payment QR Code"
                />
              </Box>

              <Stack spacing={1} sx={{ mt: 3 }}>
                <Typography variant="body2" fontWeight="500">
                  请使用支付宝或微信扫码支付
                </Typography>
                <Typography variant="caption" color="success.main">
                  支付完成后系统将自动跳转
                </Typography>
              </Stack>
              
              <Button
                fullWidth
                variant="text"
                color="inherit"
                sx={{ mt: 2, color: 'text.secondary' }}
                onClick={() => setOpen(false)}
              >
                取消并稍后支付
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BillingCard;
