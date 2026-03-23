import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
// ... (保持原有 import 不变)

// 优化 1: 将工具函数移出组件，提升性能
const checkIsMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

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

  // 🚀 支付检测逻辑优化
  useEffect(() => {
    // 增加 !paid 判断，成功后立即停止逻辑
    if (!open || !detailData?.trade_no || paid) return;

    let timer: NodeJS.Timeout;

    const check = async () => {
      try {
        const res = await fetch(`/api/v1/user/order/fetch?trade_no=${detailData.trade_no}`);
        // 优化 2: 增加基础的 fetch 成功状态判断
        if (!res.ok) return;
        
        const data = await res.json();
        if (data?.data?.status === 1) {
          // 优化 3: 成功时立即清除当前定时器，防止重复执行
          clearInterval(timer);
          setPaid(true); 
          enqueueSnackbar(t("支付成功 🎉"), { variant: "success" });

          setTimeout(() => {
            setOpen(false);
            window.location.href = `/order/${detailData.trade_no}`;
          }, 800);
        }
      } catch (err) {
        console.error("检测支付状态失败", err);
      }
    };

    check();
    timer = setInterval(check, 2000); // 优化 4: 建议间隔改到 2s，减轻服务器压力，1s 过于频繁
    return () => clearInterval(timer);
  }, [open, detailData?.trade_no, paid, enqueueSnackbar, t]);

  const lines = useMemo(
    () => [
      { 
        label: detailData?.plan.name === "deposit" ? t("order.checkout.product-info-card.deposit") : detailData?.plan.name, 
        value: t("order.checkout.billing-card.price", { value: Number((detailData?.total_amount ?? 0) / 100).toFixed(2) }) 
      },
      ...(detailData?.discount_amount || detailData?.surplus_amount ? [
        { 
          label: t("order.checkout.billing-card.deduction"), 
          value: t("order.checkout.billing-card.price", { value: (((detailData?.discount_amount ?? 0) + (detailData?.surplus_amount ?? 0)) / -100).toFixed(2) }) 
        }
      ] : []),
      { 
        label: t("order.checkout.billing-card.total-price"), 
        value: t("order.checkout.billing-card.price", { value: Number((detailData?.total_amount ?? 0) / 100).toFixed(2) }) 
      }
    ],
    [detailData, t]
  );

  const handleClick = useCallback(
    async (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      // 优化 5: 增加 isSubmitting 防抖判断
      if (isSubmitting || !detailData || !paymentMethodState) {
        if (!detailData || !paymentMethodState) enqueueSnackbar(t("notice::data-not-loaded"), { variant: "error" });
        return;
      }

      try {
        setSubmitting(true);
        ReactGA.event("click", { 
          category: "order", 
          label: "checkout", 
          method: paymentMethodIndex.get(paymentMethodState)?.name, 
          method_id: paymentMethodState 
        });

        const res = await checkoutOrder({ trade_no: detailData.trade_no, method: paymentMethodState }).unwrap();
        
        if (typeof res === "string") {
          if (checkIsMobile()) {
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
        console.error(err);
        enqueueSnackbar(t("notice::checkout-failed"), { variant: "error" });
      } finally {
        setSubmitting(false);
      }
    },
    [checkoutOrder, detailData, paymentMethodState, paymentMethodIndex, setSubmitting, enqueueSnackbar, t]
  );

  return (
    <>
      <MainCard title={t("order.checkout.billing-card.title")}>
        <Stack spacing={2} divider={<Divider />}>
          {lines.map((line, index) => isLoading ? (
            <Skeleton key={index} variant="text" width="100%" height={40} />
          ) : (
            <Stack direction="row" justifyContent="space-between" key={index}>
              <Typography>{line.label}</Typography>
              <Typography fontWeight="600">{line.value}</Typography>
            </Stack>
          ))}
          <Button fullWidth variant="contained" disabled={isLoading || isSubmitting} onClick={handleClick}>
            {isSubmitting ? t("正在跳转...") : t("order.checkout.billing-card.button")}
          </Button>
        </Stack>
      </MainCard>

      <Dialog 
        open={open} 
        maxWidth="xs"
        onClose={(_, reason) => {
          // 优化 6: 支付成功后不允许点击背景关闭弹窗，防止跳转中断
          if (!paid) setOpen(false);
        }}
      >
        <DialogContent style={{ width: 340, padding: 24, textAlign: "center", position: "relative" }}>
          {!paid && (
            <IconButton onClick={() => setOpen(false)} style={{ position: "absolute", right: 10, top: 10 }}>
              <CloseIcon />
            </IconButton>
          )}

          {paid ? (
            <Fade in={paid}>
              <Stack alignItems="center" spacing={2}>
                <Zoom in={paid}>
                  <CheckCircleIcon style={{ fontSize: 64, color: "#52c41a" }} />
                </Zoom>
                <Typography sx={{ fontSize: 20, fontWeight: 600 }}>支付成功</Typography>
                <Typography sx={{ fontSize: 13, color: "#888" }}>正在为您开通服务...</Typography>
              </Stack>
            </Fade>
          ) : (
            <>
              <Typography sx={{ fontSize: 28, fontWeight: 600 }}>
                ¥{Number((detailData?.total_amount ?? 0) / 100).toFixed(2)}
              </Typography>
              {/* ... 其余 UI 保持不变 */}
              <Typography sx={{ fontSize: 12, color: "#aaa", mb: 2 }}>{detailData?.plan?.name}</Typography>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrCodeUrl)}`} 
                style={{ width: 180, height: 180, background: '#f5f5f5' }} 
                alt="qrcode"
              />
              <Stack spacing={0.5} sx={{ mt: 2 }}>
                <Typography sx={{ fontSize: 13 }}>请使用扫码支付</Typography>
                <Typography sx={{ fontSize: 12, color: "#52c41a" }}>支付完成后自动跳转...</Typography>
              </Stack>
              <Button fullWidth variant="outlined" sx={{ mt: 3 }} onClick={() => setOpen(false)}>取消支付</Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BillingCard;
