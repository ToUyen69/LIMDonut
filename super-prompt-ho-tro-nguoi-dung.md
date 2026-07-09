# Super Prompt — Hỗ trợ trực tiếp + Phóng to chữ/Tương phản cao + Chế độ tối

Đã đọc `app.html` (đã có sẵn `<app-taste-quiz>` và modal xin định vị — dùng làm chỗ gắn thêm các
widget mới), `styles.css` (bộ biến màu gốc `--color-blue, --color-cream...`), và xác nhận project
hiện KHÔNG có: chat hỗ trợ, toggle cỡ chữ, chế độ tương phản cao, hay dark mode — cần làm mới hoàn
toàn cả 3 phần.

## PHẦN 1 — Hỗ trợ trực tiếp khi gặp vướng mắc (chat trả lời theo từ khoá)

Không cần AI/API trả phí — làm dạng "FAQ bot" trả lời theo từ khoá khớp sẵn, đủ dùng cho đồ án và
không tốn chi phí vận hành.

1. Tạo `my-app/src/app/support-chat/support-chat.component.ts` (standalone) — nút tròn nổi góc
   dưới-phải màn hình (icon `bi-chat-dots-fill`, nền `--color-blue`), đặt cạnh `<app-taste-quiz>`
   trong `app.html` (chỉ hiện khi `!isPaymentPage()` giống các widget khác).
2. Click mở 1 khung chat nhỏ, có sẵn 6-8 câu hỏi gợi ý dạng nút bấm nhanh (không bắt gõ tay):
   "Chính sách hủy đơn", "Phí ship tính sao", "Cách dùng Lịm Star", "Custom Party là gì",
   "Đặt cọc bao nhiêu", "Khiếu nại đơn hàng", "Giờ mở cửa", "Liên hệ nhân viên thật".
3. Viết `support-faq.data.ts` — mảng `{ keywords: string[], answer: string }`, nội dung câu trả
   lời PHẢI khớp đúng chính sách thật đã xác nhận trong code (không bịa số liệu):
   - Hủy đơn: đơn thường huỷ được khi còn "Đã đặt", Custom Party huỷ được trước
     `cancelDeadlineHours` (S/M: 12h, L: 24h trước giờ nhận).
   - Đặt cọc: 30% (500k-dưới 1tr), 40% (1tr-dưới 2tr), 50% (từ 2tr trở lên), dưới 500k không cọc.
   - Phí ship: ≤5km 20.000đ, 5-10km 30.000đ, 10-15km 40.000đ, >15km ngoài khu vực giao hàng.
   - Khiếu nại: trong vòng 2 giờ kể từ khi đơn "Hoàn thành".
   - Lịm Star: tích theo `round(totalAmount/1000)*100`, x2 với đơn Custom Party, x3 tháng sinh
     nhật, dùng tối đa 30% giá trị đơn.
4. Cho phép gõ tự do vào ô chat — so khớp câu gõ với `keywords` (không phân biệt hoa/thường,
   không dấu để bắt được cả gõ có dấu/không dấu), câu nào không khớp thì trả về câu mặc định
   "Mình chưa hiểu câu hỏi này, bạn có thể chọn 1 trong các câu hỏi gợi ý, hoặc để lại thông tin
   liên hệ ở trang Liên hệ để được nhân viên hỗ trợ trực tiếp nhé!" kèm nút dẫn `routerLink="/
   contact"`.
5. Không cần lưu lịch sử chat vào backend (đồ án không cần), chỉ giữ trong state component,
   reset khi đóng/mở lại.

## PHẦN 2 — Nút phóng to chữ / chế độ tương phản cao

1. Tạo `my-app/src/app/accessibility-toolbar/accessibility-toolbar.component.ts` — 1 thanh nhỏ
   nổi góc trên hoặc tích hợp vào cạnh nút chat hỗ trợ, gồm: nút `A-`/`A+` (2 mức tăng/giảm, mặc
   định 100%, tối đa 130%, tối thiểu 90%) và 1 toggle "Tương phản cao".
2. Cỡ chữ: đặt biến `--user-font-scale: 1` trên `<html>`/`<body>` (đọc/ghi qua `document.
   documentElement.style.setProperty`), nhân biến này vào `font-size` gốc của `body` trong
   `styles.css` (VD `font-size: calc(16px * var(--user-font-scale, 1));`) — vì toàn bộ project
   dùng đơn vị `rem` cho hầu hết chữ (xác nhận qua các file `.css` đã đọc), chỉ cần đổi 1 chỗ gốc
   là toàn bộ chữ trong site co giãn theo, không phải sửa từng component.
3. Tương phản cao: thêm class `.high-contrast` gắn vào `<body>` khi bật, định nghĩa lại trong
   `styles.css`: nền trắng thuần, chữ đen thuần, viền đậm hơn cho card/button, bỏ hết các sắc độ
   pastel nhạt (`--color-cream`, `--color-light-yellow`...) về màu tương phản rõ ràng hơn (VD chữ
   xám nhạt `#999`/`#636e72` đổi thành `#000`/`#222` khi ở chế độ này).
4. Lưu 2 lựa chọn này vào `localStorage` (`fontScale`, `highContrast`) — áp dụng lại ngay khi tải
   trang, không phải bật lại mỗi lần vào web.

## PHẦN 3 — Chế độ tối (Dark mode)

1. Thêm bộ biến màu tối trong `styles.css`, đặt trong `:root.dark-mode` (không dùng
   `prefers-color-scheme` tự động — để khách chủ động bật/tắt bằng nút, tránh xung đột với chế độ
   tương phản cao ở Phần 2):
   ```
   :root.dark-mode {
     --color-blue: #6fa8cc;
     --color-cream: #2a2a28;
     --color-light-green: #1c1e1c;
     --color-light-blue: #2d3b45;
     --color-pale-cyan: #24363a;
   }
   :root.dark-mode body { background-color: #16181a; color: #e8e8e6; }
   ```
   (giữ đúng các biến TÊN cũ, chỉ đổi giá trị — vì toàn bộ component đang tham chiếu qua tên biến
   `var(--color-...)`, đổi giá trị tại 1 nơi là áp dụng được toàn site mà không cần sửa từng file
   css con).
2. Thêm toggle icon mặt trời/mặt trăng (`bi-sun-fill`/`bi-moon-stars-fill`) ở góc phải header
   (`app.html`, cạnh `.user-profile-container`) — click đổi `document.documentElement.classList.
   toggle('dark-mode')`, lưu lựa chọn vào `localStorage` (`theme: 'dark'|'light'`), áp dụng lại
   ngay khi tải trang qua `APP_INITIALIZER` hoặc đọc trong `AppComponent` constructor trước khi
   render.
3. Kiểm tra riêng 2 khu vực dễ vỡ khi đổi dark mode: ảnh sản phẩm trên nền pastel nhạt (kiểm tra
   không bị "chìm" mất viền khi nền tối) và card trắng cứng (`background: #fff` hard-code ở nhiều
   nơi thay vì dùng biến) — những chỗ hard-code `#fff`/`white` cần rà lại, đổi sang biến
   `--card-bg` mới (`#fff` ở light, `#242628` ở dark) thay vì để `#fff` cứng gây card trắng chói
   giữa nền tối.

Tiêu chí xong việc:
- Bấm nút chat hỗ trợ → chọn 1 câu hỏi gợi ý hoặc gõ tự do (VD "hủy đơn thế nào") → nhận đúng câu
  trả lời khớp chính sách thật của hệ thống.
- Bấm `A+` vài lần → toàn bộ chữ trên trang to dần đều, không vỡ layout ở card/button.
- Bật "Tương phản cao" → chữ/nền chuyển sang tương phản rõ ràng, dễ đọc hơn hẳn bản mặc định.
- Bấm icon mặt trăng → toàn site chuyển nền tối, chữ sáng, không còn card trắng chói lẻ loi giữa
  nền tối; tải lại trang vẫn giữ đúng lựa chọn dark mode/cỡ chữ/tương phản đã chọn trước đó.
