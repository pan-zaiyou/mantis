import { ReactNode, useState, useEffect } from "react";

// material-ui
import { styled, useTheme, Theme } from "@mui/material/styles";
import MuiAvatar from "@mui/material/Avatar";
import { AvatarProps } from "@mui/material";

// project import
import getColors from "@/utils/getColors";

// types
import { AvatarTypeProps, ColorProps, ExtendedStyleProps, SizeProps } from "@/types/extended";

// ==============================|| 样式 ||============================== //

interface AvatarStyleProps extends ExtendedStyleProps {
  variant?: AvatarProps["variant"];
  type?: AvatarTypeProps;
}

function getColorStyle({ theme, color, type }: AvatarStyleProps) {
  const colors = getColors(theme, color);
  const { lighter, light, main, contrastText } = colors;

  switch (type) {
    case "filled":
      return { color: contrastText, backgroundColor: main };
    case "outlined":
      return { color: main, border: "1px solid", borderColor: main, backgroundColor: "transparent" };
    case "combined":
      return { color: main, border: "1px solid", borderColor: light, backgroundColor: lighter };
    default:
      return { color: main, backgroundColor: lighter };
  }
}

function getSizeStyle(size?: SizeProps) {
  switch (size) {
    case "xs": return { width: 24, height: 24 };
    case "sm": return { width: 32, height: 32 };
    case "lg": return { width: 52, height: 52 };
    case "xl": return { width: 64, height: 64 };
    default: return { width: 40, height: 40 };
  }
}

interface StyleProps {
  color: ColorProps;
  variant?: AvatarProps["variant"];
  type?: AvatarTypeProps;
  theme: Theme;
  size?: SizeProps;
}

const AvatarStyle = styled(MuiAvatar, {
  shouldForwardProp: (prop) => prop !== "color" && prop !== "type" && prop !== "size"
})(({ theme, color, type, size }: StyleProps) => ({
  ...getSizeStyle(size),
  ...getColorStyle({ theme, color, type }),
  transition: "all 0.4s ease"
}));

// ==============================|| 工具函数 ||============================== //

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// ==============================|| 主组件 ||============================== //

export interface Props extends AvatarProps {
  color?: ColorProps;
  children?: ReactNode | string;
  type?: AvatarTypeProps;
  size?: SizeProps;
}

export default function Avatar({
  variant = "circular",
  children,
  color = "primary",
  type,
  size = "md",
  ...others
}: Props) {
  const theme = useTheme();
  const { alt, src, ...rest } = others as any;

  // 🎯 判断是否“用户头像”（关键修复点）
  const isUserAvatar = typeof alt === "string" && alt.includes("@");

  const baseSeed = alt || "user";

  // 🎯 轮询 index（只给用户头像用）
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isUserAvatar) return; // ❗ 非用户头像不轮询

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % 5);
    }, 6000);

    return () => clearInterval(timer);
  }, [isUserAvatar]);

  // 🎨 二次元头像
  const seed = baseSeed + index;

  const animeUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}&radius=50&backgroundColor=ffeef8,e0f7ff,f5f5f7`;

  // 🖼️ 本地兜底
  const localIndex = (hashString(baseSeed) % 5) + 1;
  const fallback = `/assets/images/users/avatar-${localIndex}.png`;

  // 🚀 核心逻辑：只对用户头像生效
  const [imgSrc, setImgSrc] = useState(
    isUserAvatar ? animeUrl : src
  );

  useEffect(() => {
    if (isUserAvatar) {
      setImgSrc(animeUrl);
    }
  }, [animeUrl, isUserAvatar]);

  return (
    <AvatarStyle
      variant={variant}
      theme={theme}
      color={color}
      type={type}
      size={size}
      src={imgSrc}
      onError={() => {
        if (isUserAvatar) {
          setImgSrc(fallback);
        }
      }}
      {...rest}
    >
      {children}
    </AvatarStyle>
  );
}
