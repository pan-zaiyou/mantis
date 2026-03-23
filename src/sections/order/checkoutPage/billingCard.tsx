<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>支付页面</title>
<style>
  /* 全局字体和背景 */
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial;
    margin: 0;
    padding: 0;
    background-color: #f9f9f9;
    color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  /* 支付卡片 */
  .payment-card {
    background-color: #ffffff;
    border-radius: 20px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
    padding: 30px;
    width: 320px;
    text-align: center;
  }

  /* 标题 */
  .payment-card h2 {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 20px;
  }

  /* 订单号 */
  .order-number {
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
  }

  /* 二维码 */
  .qrcode {
    width: 180px;
    height: 180px;
    margin: 0 auto 20px;
    background-color: #e0e5eb;
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    color: #888;
  }

  /* 倒计时 */
  .countdown {
    font-size: 16px;
    color: #555;
    margin-bottom: 25px;
  }

  /* 按钮样式 */
  .btn {
    display: inline-block;
    width: 120px;
    padding: 12px 0;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin: 0 10px;
  }

  /* 支付按钮 */
  .btn-pay {
    background-color: #4a90e2; /* 蓝灰色 */
    color: #fff;
    border: none;
  }
  .btn-pay:hover {
    background-color: #357ABD;
  }

  /* 取消按钮 */
  .btn-cancel {
    background-color: #fff;
    color: #555;
    border: 1px solid #ccc;
  }
  .btn-cancel:hover {
    background-color: #f0f0f0;
  }

  /* 暗黑模式 */
  @media (prefers-color-scheme: dark) {
    body {
      background-color: #1c1c1e;
      color: #ddd;
    }
    .payment-card {
      background-color: #2c2c2e;
      box-shadow: 0 6px 20px rgba(0,0,0,0.5);
    }
    .order-number {
      color: #aaa;
    }
    .qrcode {
      background-color: #3a3a3c;
      color: #888;
    }
    .countdown {
      color: #ccc;
    }
    .btn-cancel {
      color: #ccc;
      border-color: #555;
    }
  }
</style>
</head>
<body>

<div class="payment-card">
  <h2>请扫码支付</h2>
  <div class="order-number">订单号: 20260323001</div>
  <div class="qrcode">二维码加载中...</div>
  <div class="countdown">剩余时间: <span id="timer">05:00</span></div>
  <div>
    <button class="btn btn-pay" onclick="alert('支付成功!')">支付</button>
    <button class="btn btn-cancel" onclick="alert('已取消支付')">取消</button>
  </div>
</div>

<script>
  // 倒计时逻辑（示例 5 分钟）
  let totalSeconds = 300;
  const timerElem = document.getElementById('timer');
  const countdown = setInterval(() => {
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    timerElem.textContent = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
    totalSeconds--;
    if (totalSeconds < 0) {
      clearInterval(countdown);
      alert('支付已超时');
    }
  }, 1000);

  // 模拟二维码加载
  setTimeout(() => {
    const qrcodeDiv = document.querySelector('.qrcode');
    qrcodeDiv.textContent = '';
    const img = document.createElement('img');
    img.src = 'https://via.placeholder.com/180?text=QR'; // 替换为实际二维码链接
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.borderRadius = '12px';
    qrcodeDiv.appendChild(img);
  }, 1000);
</script>

</body>
</html>
