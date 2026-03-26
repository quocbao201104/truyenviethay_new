-- Migration 32: Chuẩn hóa Taxonomy cho TruyenVietHay
-- Loại bỏ các thể loại không phù hợp với định hướng nội dung
DELETE FROM `theloai_new` WHERE `ten_theloai` = 'Bách Hợp';

-- Bổ sung các thể loại mới (Sử dụng INSERT IGNORE để tránh lỗi trùng lặp)
INSERT IGNORE INTO `theloai_new` (`ten_theloai`) VALUES 
('Cổ Đại'),
('Hiện Đại'),
('Dã Sử'),
('Dị Giới'),
('Tận Thế'),
('Đông Phương'),
('Tây Phương'),
('Đoản Văn'),
('Huyền Nghi'),
('Ngược'),
('Sủng'),
('Nữ Cường'),
('Nữ Phụ'),
('Quan Trường'),
('Quân Sự'),
('Lịch Sử'),
('Sắc'),
('Light Novel'),
('Sảng Văn'),
('Vô Địch Lưu'),
('Vô Hạn Lưu'),
('Khác');