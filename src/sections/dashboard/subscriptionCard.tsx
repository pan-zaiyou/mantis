import React, { useMemo } from "react";

// third-party
import dayjs from "dayjs";
import lo from "lodash-es";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";

// material-ui
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
  linearProgressClasses
} from "@mui/material";
import { styled } from "@mui/material/styles";

// project imports
import MainCard from "@/components/MainCard";
import { useGetUserSubscriptionQuery } from "@/store/services/api";

// 渐变进度条
const GradientLinearProgress = styled(LinearProgress, {
  shouldForwardProp: (prop) => prop !== "usedRatio"
})((props: any) => {
  const usedRatio: number = props.usedRatio ?? 0;
  const color =
    usedRatio >= 0.9 ? "#ff4d4f" :
    usedRatio >= 0.7 ? "#fa8c16" :
    "#1677ff";
  const trackColor =
    usedRatio >= 0.9 ? "#fff1f0" :
    usedRatio >= 0.7 ? "#fff7e6" :
    "#e6f4ff";
  return {
    height: 10,
    borderRadius: 100,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: trackColor
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 100,
      background: `linear-gradient(90deg, ${color}99, ${color})`
    }
  };
});

const SubscriptionCard: React.FC = () => {
  const { data: subscriptionInfo, isLoading } = useGetUserSubscriptionQuery();
  const { t } = useTranslation();

  const trafficUsed = useMemo(
    () =>
      subscriptionInfo
        ? (subscriptionInfo.u + subscriptionInfo.d) / subscriptionInfo.transfer_enable
        : 1,
    [subscriptionInfo]
  );

  const usedGB = useMemo(
    () => lo.round((subscriptionInfo ? subscriptionInfo.u + subscriptionInfo.d : 0) / 1073741824, 2),
    [subscriptionInfo]
  );

  const totalGB = useMemo(
    () => lo.round((subscriptionInfo?.transfer_enable ?? 0) / 1073741824, 2),
    [subscriptionInfo]
  );

  const remainGB = useMemo(
    () => lo.round(Math.max(totalGB - usedGB, 0), 2),
    [usedGB, totalGB]
  );

  const daysLeft = useMemo(() => {
    if (!subscriptionInfo?.expired_at) return null;
    return Math.max(dayjs.unix(subscriptionInfo.expired_at).diff(dayjs(), "day"), 0);
  }, [subscriptionInfo]);

  const isExpired = subscriptionInfo?.expired_at
    ? subscriptionInfo.expired_at < dayjs().unix()
    : false;

  const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && !isExpired;

  return (
    <MainCard title={<Trans i18nKey={"dashboard.subscription-card.title"}>My Subscription</Trans>}>
      {/* ── 有套餐 ── */}
      {subscriptionInfo && subscriptionInfo.plan_id !== null && (
        <Stack spacing={2.5}>

          {/* 套餐名 + 状态 */}
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Typography component={"h6"} variant={"h4"}>
              {subscriptionInfo.plan!.name}
            </Typography>
            {isExpired && (
              <Chip label="已到期" size="small" color="error" sx={{ fontWeight: 700 }} />
            )}
            {isExpiringSoon && (
              <Chip
                label={`还剩 ${daysLeft} 天`}
                size="small"
                sx={{ background: "#fff7e6", color: "#fa8c16", fontWeight: 700, border: "1px solid #ffd591" }}
              />
            )}
          </Box>

          {/* 到期时间 */}
          <Typography
            variant={"body2"}
            sx={{
              color: isExpired ? "error.main" : isExpiringSoon ? "warning.main" : "text.secondary"
            }}
          >
            {t("dashboard.subscription-card.expire", {
              context:
                subscriptionInfo.expired_at === null
                  ? "forever"
                  : isExpired
                  ? "is"
                  : "limited",
              date: dayjs.unix(subscriptionInfo.expired_at || 0).format("YYYY/MM/DD"),
              reset_date: subscriptionInfo.reset_day,
              count: daysLeft ?? undefined
            })}
          </Typography>

          {/* 流量三列 */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 1,
              background: "#f8fafd",
              borderRadius: 2,
              padding: "12px 16px"
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
                已用
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: trafficUsed >= 0.9 ? "error.main" : trafficUsed >= 0.7 ? "warning.main" : "primary.main", mt: 0.3 }}>
                {usedGB} <span style={{ fontSize: 12, fontWeight: 500, color: "#8c8c8c" }}>GB</span>
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
                剩余
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "success.main", mt: 0.3 }}>
                {remainGB} <span style={{ fontSize: 12, fontWeight: 500, color: "#8c8c8c" }}>GB</span>
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
                总量
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary", mt: 0.3 }}>
                {totalGB} <span style={{ fontSize: 12, fontWeight: 500, color: "#8c8c8c" }}>GB</span>
              </Typography>
            </Box>
          </Box>

          {/* 进度条 */}
          <Box>
            <GradientLinearProgress
              variant="determinate"
              value={Math.min(trafficUsed * 100, 100)}
              usedRatio={trafficUsed}
            />
            <Box display="flex" justifyContent="space-between" mt={0.8}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                0 GB
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color:
                    trafficUsed >= 0.9 ? "error.main" :
                    trafficUsed >= 0.7 ? "warning.main" :
                    "primary.main"
                }}
              >
                已使用 {lo.round(trafficUsed * 100, 1)}%
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {totalGB} GB
              </Typography>
            </Box>
          </Box>

          {/* 续费按钮 */}
          {(isExpired || isExpiringSoon) && (
            <Button
              variant="contained"
              color={isExpired ? "error" : "warning"}
              component={Link}
              to="/plan/buy"
              fullWidth
              sx={{ fontWeight: 700, borderRadius: "8px" }}
            >
              {isExpired ? "套餐已到期，立即续费" : `仅剩 ${daysLeft} 天，续费享优惠`}
            </Button>
          )}

        </Stack>
      )}

      {/* ── 无套餐 ── */}
      {subscriptionInfo && subscriptionInfo.plan_id === null && (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={160} gap={2}>
          <Typography variant="body1" color="text.secondary">
            {t("dashboard.subscription-card.no-subscription")}
          </Typography>
          <Button variant="contained" color="primary" component={Link} to="/plan/buy" sx={{ borderRadius: "8px" }}>
            {t("dashboard.shortcut.subscribe.buy-button")}
          </Button>
        </Box>
      )}

      {/* ── 加载中 ── */}
      {isLoading && (
        <Box display="flex" flexDirection="column" gap={1.5} minHeight={160}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="rectangular" width="100%" height={10} sx={{ borderRadius: 100 }} />
          <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 2 }} />
        </Box>
      )}
    </MainCard>
  );
};

export default SubscriptionCard;
