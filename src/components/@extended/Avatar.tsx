import { ReactNode, useState } from "react";

// material-ui
import { styled, useTheme, Theme } from "@mui/material/styles";
import MuiAvatar from "@mui/material/Avatar";
import { AvatarProps } from "@mui/material";

// project import
import getColors from "@/utils/getColors";

// types
import { AvatarTypeProps, ColorProps, ExtendedStyleProps, SizeProps } from "@/types/extended";

// ==============================|| AVATAR - COLOR STYLE ||============================== //

interface AvatarStyleProps extends ExtendedStyleProps {
  variant?: AvatarProps["variant"];
  type?: AvatarTypeProps;
}

function getColorStyle({ variant, theme, color, type }: AvatarStyleProps) {
  const colors = getColors(theme, color);
  const { lighter, light, main, contrastText } = colors;

  switch (type) {
    case "filled":
      return {
        color: contrastText,
        backgroundColor: main
      };
    case "outlined":
      return {
        color: main,
        border: "1px solid",
        borderColor: main,
        backgroundColor: "transparent"
      };
    case "combined":
      return {
        color: main,
        border: "1px solid",
        borderColor: light,
        backgroundColor: lighter
      };
    default:
      return {
        color: main,
        backgroundColor: lighter
      };
  }
}

// ==============================|| AVATAR - SIZE STYLE ||============================== //

function getSizeStyle(size?: SizeProps) {
  switch (size) {
    case "badge":
      return {
        border: "2px solid",
        fontSize: "0.675rem",
        width: 20,
        height: 20
      };
    case "xs":
      return {
        fontSize: "0.75rem",
        width: 24,
        height: 24
      };
    case "sm":
      return {
        fontSize: "0.875rem",
        width: 32,
        height: 32
      };
    case "lg":
      return {
        fontSize: "1.2rem",
        width: 52,
        height: 52
      };
    case "xl":
      return {
        fontSize: "1.5rem",
        width: 64,
        height: 64
      };
    case "md":
    default:
      return {
        fontSize: "1rem",
        width: 40,
        height: 40
      };
  }
}

// ==============================|| STYLED - AVATAR ||============================== //

interface StyleProps {
  color: ColorProps;
  variant?: AvatarProps["variant"];
  type?: AvatarTypeProps;
  theme: Theme;
  size?: SizeProps;
}

const AvatarStyle = styled(MuiAvatar, {
  shouldForwardProp: (prop) => prop !== "color" && prop !== "type" && prop !== "size"
})(({ theme, variant, color, type, size }: StyleProps) => ({
  ...getSizeStyle(size),
  ...getColorStyle({ variant, theme, color, type }),
  ...(size === "badge" && {
    borderColor: theme.palette.background.default
  })
}));

// ==============================|| EXTENDED - AVATAR ||============================== //

export interface Props extends AvatarProps {
  color?: ColorProps;
  children?: ReactNode | string;
  type?: AvatarTypeProps;
  size?: SizeProps;
}

// 🔥 生成稳定随机数（同一个用户永远一样）
function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
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
  const { src, alt, ...rest } = others as any;

  // 👇 用 alt 或 fallback 作为唯一标识
  const seed = alt || "default";

  // 🔥 外网头像（科技风）
  const dicebearUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;

  // 🔥 本地头像（1~5稳定分配）
  const index = (hashString(seed) % 5) + 1;
  const localAvatar = `/assets/images/users/avatar-${index}.png`;

  // 👇 控制是否使用本地头像
  const [imgSrc, setImgSrc] = useState(src || dicebearUrl);

  return (
    <AvatarStyle
      variant={variant}
      theme={theme}
      color={color}
      type={type}
      size={size}
      src={imgSrc}
      onError={() => {
        // 👇 外网失败 → 自动切换本地
        if (imgSrc !== localAvatar) {
          setImgSrc(localAvatar);
        }
      }}
      {...rest}
    >
      {children}
    </AvatarStyle>
  );
}
