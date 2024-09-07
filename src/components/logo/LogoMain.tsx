import { useTheme } from '@mui/material/styles';

// ==============================|| LOGO SVG ||============================== //

const LogoMain = ({ reverse, ...others }: { reverse?: boolean }) => {
  const theme = useTheme();
  
  // 根据主题模式设置 SVG 的填充颜色
  const fillColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';

  return (
    <div
      style={{
        position: 'absolute',
        top: '-5px',  // 向下移动一点点
        left: '0px', // 稍微向右移动
        zIndex: 10,
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="500" zoomAndPan="magnify" viewBox="0 0 375 374.999991" height="500" preserveAspectRatio="xMidYMid meet" version="1.0"><defs><g/></defs><path fill="#000000" d="M 95.734375 140.941406 L 136.476562 181.683594 L 122.609375 195.574219 L 95.734375 168.695312 L 86.289062 178.183594 L 72.378906 164.292969 Z M 68.09375 168.597656 L 81.960938 182.503906 L 95.011719 195.511719 L 81.101562 209.378906 L 54.265625 182.542969 L 32.875 203.9375 L 27.390625 209.382812 L 13.523438 195.515625 L 54.265625 154.773438 Z M 68.09375 168.597656 " fill-opacity="1" fill-rule="nonzero"/><g fill="#251e20" fill-opacity="1"><g transform="translate(135.145952, 203.897565)"><g><path d="M 8.828125 -43.46875 L 18.90625 -43.46875 L 18.90625 -33.09375 L 8.828125 -33.09375 Z M 17.171875 -6.375 L 17.171875 -17.046875 L 23.3125 -17.046875 L 23.3125 -20.984375 L 17.171875 -20.984375 L 17.171875 -29.21875 L 22.78125 -29.21875 L 22.78125 -47.34375 L 5.125 -47.34375 L 5.125 -29.21875 L 13.296875 -29.21875 L 13.296875 -5.359375 L 9 -4.234375 L 9 -23.609375 L 5.421875 -23.609375 L 5.421875 -3.40625 L 2.5 -2.6875 L 3.640625 1.546875 L 25.515625 -4.59375 L 24.984375 -8.46875 Z M 24.859375 -18.125 L 31.953125 -18.125 C 31.0625 -14.90625 29.9375 -11.15625 28.921875 -8.46875 L 48.359375 -8.46875 C 47.703125 -2.859375 46.984375 -0.234375 45.96875 0.59375 C 45.375 1.078125 44.59375 1.078125 43.34375 1.078125 C 41.796875 1.078125 37.5 1.015625 33.390625 0.65625 C 34.171875 1.78125 34.828125 3.34375 34.9375 4.53125 C 38.9375 4.765625 42.75 4.828125 44.546875 4.703125 C 46.75 4.65625 48.125 4.359375 49.3125 3.15625 C 50.921875 1.671875 51.75 -1.96875 52.59375 -10.375 C 52.65625 -11.03125 52.703125 -12.21875 52.703125 -12.21875 L 34.28125 -12.21875 C 34.875 -14.078125 35.484375 -16.15625 36.078125 -18.125 L 56.046875 -18.125 L 56.046875 -21.9375 L 24.859375 -21.9375 Z M 32.4375 -30.59375 C 34.765625 -32.90625 36.84375 -35.53125 38.640625 -38.515625 L 42.28125 -38.515625 C 43.703125 -35.78125 45.546875 -33.03125 47.765625 -30.59375 Z M 56.40625 -38.515625 L 56.40625 -42.390625 L 40.671875 -42.390625 C 41.5 -44.1875 42.21875 -46.09375 42.8125 -48.0625 L 38.9375 -49.078125 C 38.21875 -46.6875 37.265625 -44.421875 36.25 -42.390625 L 25.578125 -42.390625 L 25.578125 -38.515625 L 33.859375 -38.515625 C 30.890625 -34.40625 27.1875 -31.0625 22.84375 -28.625 C 23.5 -27.71875 24.6875 -25.640625 25.109375 -24.75 C 27.546875 -26.234375 29.8125 -28.078125 31.90625 -30.046875 L 31.90625 -26.890625 L 47.765625 -26.890625 L 47.765625 -30.59375 C 49.96875 -28.03125 52.46875 -25.765625 54.859375 -24.203125 C 55.515625 -25.34375 56.875 -26.828125 57.78125 -27.609375 C 53.609375 -29.8125 49.3125 -34.109375 46.5625 -38.515625 Z M 56.40625 -38.515625 "/></g></g></g><g fill="#251e20" fill-opacity="1"><g transform="translate(191.792138, 203.897565)"><g><path d="M 55.8125 -42.28125 C 54.5625 -44.0625 52 -47.046875 49.96875 -49.3125 L 46.859375 -47.640625 C 48.953125 -45.375 51.390625 -42.21875 52.65625 -40.359375 Z M 33.859375 -16.09375 L 33.859375 -35.71875 L 41.5625 -35.71875 C 42.03125 -27.78125 42.9375 -20.8125 44.234375 -15.390625 C 41.203125 -11.328125 37.625 -7.984375 33.5625 -5.84375 C 34.46875 -5.0625 35.59375 -3.640625 36.3125 -2.6875 C 39.765625 -4.765625 42.875 -7.578125 45.671875 -10.90625 C 47.21875 -6.671875 49.375 -4.234375 52 -4.234375 C 55.390625 -4.234375 56.578125 -6.671875 57.234375 -14.734375 C 56.21875 -15.078125 54.96875 -15.921875 54.140625 -16.8125 C 53.90625 -10.859375 53.421875 -8.234375 52.46875 -8.234375 C 50.921875 -8.234375 49.609375 -10.546875 48.421875 -14.671875 C 51.578125 -19.4375 54.078125 -24.984375 55.8125 -31.0625 L 52.34375 -32.015625 C 51.09375 -27.71875 49.421875 -23.609375 47.21875 -19.96875 C 46.5 -24.265625 45.90625 -29.640625 45.5 -35.71875 L 57.0625 -35.71875 L 57.0625 -39.53125 L 45.3125 -39.53125 C 45.203125 -42.8125 45.140625 -46.265625 45.140625 -49.78125 L 41.015625 -49.78125 C 41.078125 -46.328125 41.203125 -42.875 41.3125 -39.53125 L 29.875 -39.53125 L 29.875 -16.578125 C 29.875 -14.1875 28.265625 -13 27.1875 -12.40625 C 27.90625 -11.5 28.796875 -9.59375 29.09375 -8.53125 C 29.984375 -9.484375 31.484375 -10.5 41.625 -16.390625 C 41.265625 -17.109375 40.78125 -18.71875 40.546875 -19.796875 Z M 19.140625 -14.90625 L 27.421875 -14.90625 L 27.421875 -18.84375 L 19.140625 -18.84375 L 19.140625 -27.015625 L 28.375 -27.015625 L 28.375 -31 L 18.25 -31 L 18.25 -38.578125 L 27.1875 -38.578125 L 27.1875 -42.515625 L 18.25 -42.515625 L 18.25 -49.84375 L 14.125 -49.84375 L 14.125 -42.515625 L 5.015625 -42.515625 L 5.015625 -38.578125 L 14.125 -38.578125 L 14.125 -31 L 2.796875 -31 L 2.796875 -27.015625 L 15.078125 -27.015625 L 15.078125 -6.015625 C 12.8125 -8.109375 11.15625 -11.09375 9.84375 -15.140625 C 9.953125 -17.765625 10.015625 -20.390625 9.953125 -22.890625 L 6.203125 -23.078125 C 6.375 -15.203125 5.96875 -5.3125 1.78125 1.734375 C 2.6875 2.140625 4.171875 3.453125 4.765625 4.40625 C 7.03125 0.78125 8.28125 -3.515625 9 -7.8125 C 13.59375 0.890625 20.984375 3.046875 33.984375 3.046875 L 55.8125 3.046875 C 56.109375 1.734375 56.875 -0.296875 57.59375 -1.375 C 54.140625 -1.25 36.671875 -1.25 33.984375 -1.25 C 27.78125 -1.25 22.953125 -1.78125 19.140625 -3.453125 Z M 19.140625 -14.90625 "/></g></g></g><g fill="#251e20" fill-opacity="1"><g transform="translate(248.438325, 203.897565)"><g><path d="M 45.734375 -48.53125 C 40.546875 -42.390625 31.953125 -36.734375 23.609375 -33.265625 C 24.6875 -32.4375 26.46875 -30.703125 27.1875 -29.75 C 35.296875 -33.6875 44.296875 -39.765625 50.140625 -46.625 Z M 56.046875 -22.296875 L 56.046875 -26.65625 L 19.5 -26.65625 L 19.5 -49.484375 L 14.90625 -49.484375 L 14.90625 -26.65625 L 3.515625 -26.65625 L 3.515625 -22.296875 L 14.90625 -22.296875 L 14.90625 -3.34375 C 14.90625 -1.015625 13.46875 -0.171875 12.515625 0.296875 C 13.234375 1.25 14.015625 3.09375 14.3125 4.234375 C 15.734375 3.28125 17.953125 2.5625 34.171875 -1.734375 C 33.921875 -2.75 33.75 -4.59375 33.75 -5.90625 L 19.5 -2.390625 L 19.5 -22.296875 L 28.796875 -22.296875 C 33.5625 -10.015625 41.96875 -1.25 54.3125 2.796875 C 54.96875 1.546875 56.28125 -0.359375 57.421875 -1.25 C 46.03125 -4.53125 37.75 -12.109375 33.328125 -22.296875 Z M 56.046875 -22.296875 "/></g></g></g><g fill="#251e20" fill-opacity="1"><g transform="translate(305.084506, 203.897565)"><g><path d="M 19.5625 -13.890625 L 13.765625 -11.75 L 13.765625 -31.296875 L 19.4375 -31.296875 L 19.4375 -35.421875 L 13.765625 -35.421875 L 13.765625 -49.1875 L 9.65625 -49.1875 L 9.65625 -35.421875 L 3.40625 -35.421875 L 3.40625 -31.296875 L 9.65625 -31.296875 L 9.65625 -10.25 C 7.03125 -9.296875 4.65625 -8.46875 2.6875 -7.8125 L 4.109375 -3.453125 C 8.765625 -5.3125 14.734375 -7.578125 20.390625 -9.953125 Z M 51.453125 -30.046875 C 50.140625 -24.5625 48.421875 -19.609375 46.03125 -15.203125 C 45.140625 -21.046875 44.421875 -28.4375 44.125 -36.671875 L 56.578125 -36.671875 L 56.578125 -40.78125 L 52.234375 -40.78125 L 55.21875 -42.8125 C 53.78125 -44.84375 50.734375 -47.578125 48.125 -49.484375 L 45.140625 -47.578125 C 47.640625 -45.609375 50.5625 -42.6875 52 -40.78125 L 44 -40.78125 C 43.9375 -43.703125 43.9375 -46.8125 43.9375 -49.90625 L 39.703125 -49.90625 C 39.703125 -46.8125 39.765625 -43.765625 39.890625 -40.78125 L 21.9375 -40.78125 L 21.9375 -22.359375 C 21.9375 -14.671875 21.34375 -4.890625 15.390625 1.96875 C 16.34375 2.5 18 3.9375 18.65625 4.765625 C 25.046875 -2.625 26.0625 -13.953125 26.0625 -22.296875 L 26.0625 -24.921875 L 33.5625 -24.921875 C 33.390625 -14.25 33.15625 -10.4375 32.5 -9.546875 C 32.25 -9 31.78125 -8.9375 31.0625 -8.9375 C 30.296875 -8.9375 28.4375 -8.9375 26.40625 -9.125 C 27.015625 -8.109375 27.3125 -6.5625 27.421875 -5.359375 C 29.578125 -5.25 31.65625 -5.25 32.796875 -5.359375 C 34.21875 -5.546875 35.125 -5.96875 35.828125 -7.03125 C 36.96875 -8.53125 37.203125 -13.296875 37.390625 -26.890625 C 37.4375 -27.421875 37.4375 -28.671875 37.4375 -28.671875 L 26.0625 -28.671875 L 26.0625 -36.671875 L 40.015625 -36.671875 C 40.421875 -26.359375 41.3125 -17.046875 42.875 -9.953125 C 39.65625 -5.359375 35.78125 -1.546875 31.125 1.3125 C 32.015625 1.90625 33.625 3.515625 34.21875 4.359375 C 38.046875 1.78125 41.3125 -1.375 44.1875 -5.015625 C 46.03125 0.59375 48.53125 3.9375 51.875 3.9375 C 55.75 3.9375 57 1.1875 57.65625 -7.75 C 56.578125 -8.171875 55.21875 -9.0625 54.375 -10.015625 C 54.140625 -3.15625 53.546875 -0.234375 52.40625 -0.234375 C 50.390625 -0.234375 48.65625 -3.578125 47.21875 -9.296875 C 50.859375 -14.96875 53.609375 -21.640625 55.578125 -29.390625 Z M 51.453125 -30.046875 "/></g></g></g></svg>
    </div>
  );
};

export default LogoMain;
